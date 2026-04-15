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
    console.warn(`[${name}] error ${json.J_API_ERROR_CODE} ${json.J_API_ERROR_MESSAGE}`);
    throw {
      code: json.J_API_ERROR_CODE || "ERROR_UNKNOWN",
      messageError: json.J_API_ERROR_MESSAGE || "Unknown error",
      params: json.J_API_ERROR_PARAMS || [],
      cweb: true,
    };
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

/**
 * Send an RPC request using the caller's access token, refreshing once if it's expired.
 */
async function sendRequestAuthenticated(req, res, name, request = {}, dataOutput = []) {
  const {cookies, accessToken, refreshToken} = readTokens(req, res);

  async function attempt(token) {
    return sendRequest(name, {...request, J_API_ACCESS_TOKEN: token}, false, dataOutput);
  }

  if (!accessToken && !refreshToken) {
    throw {code: "ERROR_UNAUTHORIZED", messageError: "No auth tokens", params: [], cweb: true};
  }

  try {
    if (accessToken) return await attempt(accessToken);
    throw {code: "ERROR_UNAUTHORIZED"};
  } catch (e) {
    if (e.code !== "ERROR_UNAUTHORIZED" || !refreshToken) throw e;
    // try refreshing
    let fresh;
    try {
      fresh = await refreshAccessToken(refreshToken);
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
    return await attempt(fresh.accessToken);
  }
}

/**
 * Same as sendRequestAuthenticated, but falls back to an unauthenticated call when
 * no tokens are present (for pages that work for guests too).
 */
async function sendRequestAlwaysAuthenticated(req, res, name, request = {}, dataOutput = []) {
  const {accessToken, refreshToken} = readTokens(req, res);
  if (accessToken || refreshToken) {
    return await sendRequestAuthenticated(req, res, name, request, dataOutput);
  }
  return await sendRequest(name, request, false, dataOutput);
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
