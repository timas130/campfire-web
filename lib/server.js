const certJson = require("../cert.pem.json");
const tls = require("tls");
const Cookies = require("cookies");
const {googleClientId} = require("./google");

const host = "46.254.16.245";
const port = 4026;
const portMedia = 4023;
const cert = certJson.cert;
// it's 15 minutes in the app, but the token expires much earlier
const tokenValidFor = 1000 * 60 * 5;
const refreshTokenValidFor = 1000 * 60 * 60 * 24 * 30;

let sessionTicket = null;

// TODO: maybe simplify these function a bit?

/**
 * Send a request to the server.
 * @param {string} name name of the request, put in `request["J_REQUEST_NAME"]`
 * @param {{[p: string]: *}} request request data, merged with the basic request data
 * @param {boolean} [media=false] true if the request should go the media server and the answer is a {@link Buffer}
 * @param {Uint8Array[]} [dataOutput=[]] array of dataSources to send
 * @returns {Promise<{J_STATUS: string, J_RESPONSE: {[p: string]: *}, [p: string]: *} | Buffer>} the server response
 */
function sendRequest(
  name, request,
  media = false, dataOutput = []
) {
  return new Promise((resolve, reject) => {
    request["J_REQUEST_NAME"] = name;
    request["J_REQUEST_DATE"] = Date.now();
    request["requestApiVersion"] = "1.251";
    request["requestProjectKey"] = "Campfire";
    request["dataOutput"] = dataOutput.map(buffer => buffer ? buffer.byteLength : -1);
    if (name !== "RPublicationsKarmaAdd") request["J_API_BOT_TOKEN"] = process.env.BOT_TOKEN || undefined;

    const data = JSON.stringify(request);
    const dataBuffer = Buffer.from(data);
    const dataLength = dataBuffer.byteLength;

    const socket = tls.connect({
      host, port: media ? portMedia : port, ca: [cert],
      timeout: 15,
      rejectUnauthorized: false,
      session: sessionTicket,
      // the server usually responds within 1-2 seconds,
      // so anything >10 is too much, even for expensive
      // requests
    }, () => {
      const toSend = Buffer.alloc(dataLength + 4);
      // set the data length as a 32-bit integer
      toSend.writeUInt32BE(dataLength, 0);
      // copy the actual data
      dataBuffer.copy(toSend, 4);
      // and send it to the server
      socket.write(toSend);

      // send the data outputs
      dataOutput.forEach(buffer => buffer && socket.write(buffer));
    });
    socket.on("error", err => {
      reject(err);
      socket.destroy();
    });
    socket.on("session", session => sessionTicket = session);

    let result = Buffer.alloc(0);
    let respLen = null;
    socket.on("data", data => {
      try {
        result = Buffer.concat([result, data]);
        if (result.length >= 4 && !respLen) {
          respLen = result.readUInt32BE(0);
        }
        if (respLen && result.length >= respLen) {
          if (request["$$dataload$$"]) {
            const data = result.subarray(4, 4 + respLen);
            resolve(data);
          } else {
            const encodedJson = result.toString("utf8", 4, 4 + respLen);
            const json = JSON.parse(encodedJson);
            // hide the tokens, log the request for debug
            request["J_API_ACCESS_TOKEN"] = undefined;
            request["J_API_REFRESH_TOKEN"] = undefined;
            request["J_API_LOGIN_TOKEN"] = undefined;
            request["J_API_BOT_TOKEN"] = undefined;
            console.log(`[${name}] ${JSON.stringify(request)}`);
            if (json["J_STATUS"] === "J_STATUS_OK") {
              resolve(json);
            } else {
              console.warn(`[${name}] request error ${JSON.stringify(json["J_RESPONSE"])}`);
              reject(json["J_RESPONSE"]);
            }
          }
          socket.end();
        }
      } catch (e) {
        reject(e);
        socket.end();
      }
    });
    socket.on("end", () => {
      reject(new Error("unknown server error"));
    });
  });
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
