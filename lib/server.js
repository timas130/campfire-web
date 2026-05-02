const Cookies = require("cookies");
const {graphql} = require("./graphql");

const rpcUrl = "https://cf2.bonfire.moe/";

// access token ~15 min from server; refresh with 1-min safety margin
const tokenValidFor = 1000 * 60 * 14;
const refreshTokenValidFor = 1000 * 60 * 60 * 24 * 30;

/**
 * Send a request to the RPC server (cf2.bonfire.moe).
 * @param {string} name request class name, put into `J_REQUEST_NAME`
 * @param {{[p: string]: *}} request request fields, merged with base envelope
 * @param {boolean} [media=false] unused; kept for API compatibility
 * @param {(Buffer|Uint8Array)[]} [dataOutput=[]] binary payloads (base64-encoded into `dataOutputBase64`)
 * @returns {Promise<{J_STATUS: string, J_RESPONSE: {[p: string]: *}}>}
 */
async function sendRequest(name, request, media = false, dataOutput = []) {
  const body = {
    ...request,
    J_REQUEST_NAME: name,
    J_REQUEST_DATE: Date.now(),
    requestApiVersion: "3.1",
    requestProjectKey: "Campfire",
  };
  if (dataOutput.length > 0) {
    body.dataOutputBase64 = dataOutput.map(buf =>
      buf ? Buffer.from(buf).toString("base64") : null
    );
  }
  // do NOT send J_API_BOT_TOKEN — new backend doesn't support it

  // strip before logging
  const logBody = {...body};
  delete logBody.J_API_ACCESS_TOKEN;
  delete logBody.J_API_REFRESH_TOKEN;
  delete logBody.J_API_LOGIN_TOKEN;
  delete logBody.dataOutputBase64;

  let resp;
  try {
    resp = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Json-Only": "true",
      },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw {
      code: "ERROR_NETWORK",
      messageError: e.message || "Network failure",
      params: [],
      cweb: true,
    };
  }

  if (resp.status === 429) {
    throw {code: "ERROR_RATE_LIMIT", messageError: "Rate limited", params: [], cweb: true};
  }

  if (!resp.ok) {
    // backend returned non-2xx with no RPC envelope — e.g. plain-text 500 for
    // unsupported request names, or an upstream gateway failure
    const text = await resp.text().catch(() => "");
    throw {
      code: "ERROR_RPC_HTTP_" + resp.status,
      messageError: text.slice(0, 200) || `HTTP ${resp.status}`,
      params: [],
      cweb: true,
    };
  }

  const json = await resp.json();
  console.log(`[${name}] ${JSON.stringify(logBody)}`);

  if (json.J_STATUS === "J_STATUS_OK") {
    return json;
  } else {
    const code = json.J_API_ERROR_CODE || json.J_RESPONSE?.code || "ERROR_UNKNOWN";
    const msg = json.J_API_ERROR_MESSAGE || json.J_RESPONSE?.messageError || "Unknown error";
    const params = json.J_API_ERROR_PARAMS || json.J_RESPONSE?.params || [];
    console.warn(`[${name}] error ${code} ${msg}`);
    throw {code, messageError: msg, params, cweb: true};
  }
}

function readTokens(req, res) {
  const cookies = new Cookies(req, res, {secure: true});
  return {
    cookies,
    accessToken: req.headers["x-cf-access-token"] || cookies.get("access_token") || null,
    refreshToken: req.headers["x-cf-refresh-token"] || cookies.get("refresh_token") || null,
  };
}

function writeTokens(cookies, {accessToken, refreshToken}) {
  if (accessToken) {
    cookies.set("access_token", accessToken, {
      maxAge: tokenValidFor, sameSite: "strict", overwrite: true, secure: true, httpOnly: true, path: "/",
    });
  }
  if (refreshToken) {
    cookies.set("refresh_token", refreshToken, {
      maxAge: refreshTokenValidFor, sameSite: "strict", overwrite: true, secure: true, httpOnly: true, path: "/",
    });
  }
}

function clearTokens(cookies) {
  cookies.set("access_token", "", {maxAge: 0, overwrite: true, secure: true, httpOnly: true, path: "/"});
  cookies.set("refresh_token", "", {maxAge: 0, overwrite: true, secure: true, httpOnly: true, path: "/"});
}

async function refreshAccessToken(refreshToken) {
  const data = await graphql(
    `mutation Refresh($rt: String!) {
       loginRefresh(refreshToken: $rt) { accessToken refreshToken }
     }`,
    {rt: refreshToken}
  );
  return data.loginRefresh;
}

// Refresh proactively when the JWT is within this window of expiry.
const proactiveRefreshMarginMs = 1000 * 60 * 5;

function jwtExpiryMs(token) {
  try {
    const [, payload] = token.split(".");
    const {exp} = JSON.parse(Buffer.from(payload, "base64url").toString());
    return typeof exp === "number" ? exp * 1000 : null;
  } catch {
    return null;
  }
}

function accessTokenNearExpiry(token) {
  const expiry = jwtExpiryMs(token);
  // if we can't decode, defer to the reactive retry below
  return expiry !== null && expiry - Date.now() < proactiveRefreshMarginMs;
}

// Dedup concurrent refreshes — keyed by the refresh-token string so parallel
// /api/* routes sharing the same expired access token don't each try to rotate
// the (one-use, server-side) refresh token.
const refreshInFlight = new Map();

function dedupRefresh(refreshToken) {
  const existing = refreshInFlight.get(refreshToken);
  if (existing) return existing;
  const p = refreshAccessToken(refreshToken).finally(() => {
    refreshInFlight.delete(refreshToken);
  });
  refreshInFlight.set(refreshToken, p);
  return p;
}

async function performRefresh(cookies, refreshToken) {
  let fresh;
  try {
    fresh = await dedupRefresh(refreshToken);
  } catch (refreshErr) {
    // server actively refused the refresh token → cookies are useless, clear them
    // network errors are transient → keep cookies so a retry can succeed
    if (refreshErr.code !== "ERROR_NETWORK") {
      clearTokens(cookies);
    }
    throw refreshErr;
  }
  if (!fresh?.accessToken) {
    clearTokens(cookies);
    throw {code: "ERROR_UNAUTHORIZED", messageError: "Refresh returned no access token", params: [], cweb: true};
  }
  writeTokens(cookies, fresh);
  return fresh.accessToken;
}

/**
 * Send an RPC request using the caller's access token, refreshing proactively
 * when the JWT is near expiry and reactively once on failure.
 */
async function sendRequestAuthenticated(req, res, name, request = {}, dataOutput = []) {
  let {cookies, accessToken, refreshToken} = readTokens(req, res);

  if (!accessToken && !refreshToken) {
    throw {code: "ERROR_UNAUTHORIZED", messageError: "No auth tokens", params: [], cweb: true};
  }

  // Proactive refresh: access token missing or within 5 min of expiry.
  // After this, reactive retry is disabled (one refresh per request).
  let canRetry = Boolean(refreshToken);
  if (refreshToken && (!accessToken || accessTokenNearExpiry(accessToken))) {
    accessToken = await performRefresh(cookies, refreshToken);
    canRetry = false;
  }

  async function attempt(token) {
    return sendRequest(name, {...request, J_API_ACCESS_TOKEN: token}, false, dataOutput);
  }

  try {
    return await attempt(accessToken);
  } catch (e) {
    // Backend auth-failure signaling is inconsistent: some RPCs return plain
    // HTTP 500, others J_STATUS_ERROR with null error fields, GraphQL returns
    // GRAPHQL_ERROR with "InvalidToken:" / "TokenExpired:" messages. Rather than
    // pattern-matching unreliable codes, retry once on any non-network error
    // when we still have a refresh token available.
    if (!canRetry || e.code === "ERROR_NETWORK") throw e;
    accessToken = await performRefresh(cookies, refreshToken);
    return await attempt(accessToken);
  }
}

// ---------- Service account (for unauthenticated visitors) ----------
//
// Almost every RPC requires auth. When no visitor tokens are present we fall
// back to a service account. The refresh token is supplied via env var —
// loginRefresh does not rotate it, so a single long-lived value works across
// restarts and machines. The access token lives only in RAM.

let serviceAccessToken = null;
let serviceRefreshInFlight = null;

async function getServiceAccountAccessToken() {
  const refreshToken = process.env.SERVICE_ACCOUNT_REFRESH_TOKEN;
  if (!refreshToken) {
    throw {
      code: "ERROR_NO_SERVICE_ACCOUNT",
      messageError: "SERVICE_ACCOUNT_REFRESH_TOKEN env var not set",
      params: [], cweb: true,
    };
  }

  if (serviceAccessToken && !accessTokenNearExpiry(serviceAccessToken)) {
    return serviceAccessToken;
  }

  if (!serviceRefreshInFlight) {
    serviceRefreshInFlight = dedupRefresh(refreshToken)
      .then(fresh => {
        if (!fresh?.accessToken) {
          throw {
            code: "ERROR_UNAUTHORIZED",
            messageError: "Service account refresh returned no access token",
            params: [], cweb: true,
          };
        }
        serviceAccessToken = fresh.accessToken;
        return fresh.accessToken;
      })
      .finally(() => { serviceRefreshInFlight = null; });
  }
  return await serviceRefreshInFlight;
}

/**
 * Same as sendRequestAuthenticated but falls back to the service account when
 * the visitor has no tokens of their own. Almost every backend RPC requires
 * auth, so this is the right default for guest-visible pages.
 */
async function sendRequestAlwaysAuthenticated(req, res, name, request = {}, dataOutput = []) {
  // req/res are null when invoked from getStaticProps (ISR) — no visitor session
  // to read, go straight to the service account
  if (req && res) {
    const {accessToken, refreshToken} = readTokens(req, res);
    if (accessToken || refreshToken) {
      return await sendRequestAuthenticated(req, res, name, request, dataOutput);
    }
  }
  const serviceToken = await getServiceAccountAccessToken();
  return await sendRequest(name, {...request, J_API_ACCESS_TOKEN: serviceToken}, false, dataOutput);
}

module.exports = {
  sendRequest,
  sendRequestAlwaysAuthenticated,
  sendRequestAuthenticated,
  readTokens,
  writeTokens,
  clearTokens,
  graphql,
};
