const Cookies = require("cookies");
const {googleClientId} = require("./google");

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

/**
 * Send a request to the server, always authenticated.
 * If {@link req} has an authentication cookie, then it is
 * used (it gets passed to {@link sendRequestAuthenticated}.
 * Else, `process.env.LOGIN_TOKEN` is used to login.
 * @param {IncomingMessage} req the client request (provided by next.js)
 * @param {ServerResponse} res the server response (provided by next.js)
 * @param {string} name see {@link sendRequest}
 * @param {{[p: string]: *}} request see {@link sendRequest}
 * @param {Uint8Array[]} [dataOutput=[]] see {@link sendRequest}
 * @returns {Promise<{J_STATUS: string, J_RESPONSE: {[p: string]: *}, [p: string]: *} | Buffer>} the server response
 */
async function sendRequestAlwaysAuthenticated(
  req, res,
  name, request = {},
  dataOutput = []
) {
  const loginToken = req ? (
    req.headers["x-cf-login-token"] ||
    (() => {
      const cookies = new Cookies(req, res, {secure: true});
      return cookies.get("google_access_token") || cookies.get("google_refresh_token");
    })()
  ) : null;
  if (loginToken) {
    return await sendRequestAuthenticated(req, res, name, request, dataOutput);
  } else {
    request["J_API_ACCESS_TOKEN"] = process.env.ACCESS_TOKEN;
    return await sendRequest(name, request, false, dataOutput);
  }
}

/**
 * Send a request using the authentication cookie in {@link req}.
 * If the server changes the access/refresh token, a cookie is set.
 * If the request contains a login token, a cookie is set too.
 * @param {IncomingMessage} req the client request (provided by next.js)
 * @param {ServerResponse} res the server response (provided by next.js)
 * @param {string} name see {@link sendRequest}
 * @param {{[p: string]: *}} request see {@link sendRequest}
 * @param {Uint8Array[]} [dataOutput=[]] see {@link sendRequest}
 * @returns {Promise<{J_STATUS: string, J_RESPONSE: {[p: string]: *}, [p: string]: *} | Buffer>} the server response
 */
async function sendRequestAuthenticated(
  req, res,
  name, request = {},
  dataOutput = []
) {
  const cookies = new Cookies(req, res, {secure: true});

  const token = req.headers["x-cf-access-token"] ||
    (cookies.get("token") && Buffer.from(cookies.get("token"), "base64").toString());
  const refreshToken = req.headers["x-cf-refresh-token"];
  let loginToken = req.headers["x-cf-login-token"];

  const googleAccessToken = cookies.get("google_access_token");
  if (!loginToken && googleAccessToken) {
    // INSANE HACK
    loginToken = "&access_token=" + googleAccessToken;
  }

  // get the tokens
  if (token) {
    request["J_API_ACCESS_TOKEN"] = token;
  } else if (refreshToken) {
    request["J_API_REFRESH_TOKEN"] = refreshToken;
  } else if (loginToken) {
    request["J_API_LOGIN_TOKEN"] = loginToken;
  } else if (cookies.get("google_refresh_token")) {
    const resp = await fetch("https://www.googleapis.com/oauth2/v4/token", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        client_id: googleClientId,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        refresh_token: cookies.get("google_refresh_token"),
        grant_type: "refresh_token",
      }),
    }).then(a => a.json());
    if (!resp.error) {
      const accessToken = resp.access_token;
      cookies.set("google_access_token", accessToken, {
        maxAge: resp.expires_in * 1000 - 100000,
        sameSite: "strict",
        overwrite: true,
        secure: true,
      });

      loginToken = accessToken;
      request["J_API_LOGIN_TOKEN"] = accessToken;
    }
  }

  // get the response and set the tokens
  let response;
  try {
    response = await sendRequest(name, request, false, dataOutput);
  } catch (e) {
    if (e.code === "ERROR_UNAUTHORIZED" && loginToken && (token || refreshToken)) {
      request["J_API_ACCESS_TOKEN"] = undefined;
      request["J_API_REFRESH_TOKEN"] = undefined;
      request["J_API_LOGIN_TOKEN"] = loginToken;
      response = await sendRequest(name, request, false, dataOutput);
    } else {
      throw e;
    }
  }

  if (typeof response["J_API_ACCESS_TOKEN"] === "string") {
    cookies.set(
      "token", Buffer.from(response["J_API_ACCESS_TOKEN"]).toString("base64"), {
        maxAge: tokenValidFor,
        sameSite: "strict",
        overwrite: true,
      },
    );
  }

  return response;
}

module.exports = {
  sendRequest,
  sendRequestAlwaysAuthenticated,
  sendRequestAuthenticated,
};
