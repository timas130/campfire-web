import tls from "tls";
import Cookies from "cookies";
import cache from "memory-cache";
import certJson from "../../cert.pem.json";

const host = "46.254.16.245";
const port = 4026;
const portMedia = 4023;
const cert = certJson.cert;
// it's 15 minutes in the app, but the token expires much earlier
const tokenValidFor = 1000 * 60 * 5;
const refreshTokenValidFor = 1000 * 60 * 60 * 24 * 30;

/**
 * Send a request to the server.
 * @param {string} name name of the request, put in `request["J_REQUEST_NAME"]`
 * @param {{[p: string]: *}} request request data, merged with the basic request data
 * @param {boolean} [media=false] true if the request should go the media server and the answer is a {@link Buffer}
 * @returns {Promise<{J_STATUS: string, J_RESPONSE: {[p: string]: *}, [p: string]: *} | Buffer>} the server response
 */
export function sendRequest(name, request, media = false) {
  return new Promise((resolve, reject) => {
    request["J_REQUEST_NAME"] = name;
    request["J_REQUEST_DATE"] = Date.now();
    request["requestApiVersion"] = "1.251";
    request["requestProjectKey"] = "Campfire";

    const data = JSON.stringify(request);
    const dataBuffer = Buffer.from(data);
    const dataLength = dataBuffer.byteLength;

    const socket = tls.connect({
      host, port: media ? portMedia : port, ca: [cert],
      checkServerIdentity(host, cert1) {}
    }, () => {
      const toSend = Buffer.alloc(dataLength + 4);
      // set the data length as a 32-bit integer
      toSend.writeUInt32BE(dataLength, 0);
      // copy the actual data
      dataBuffer.copy(toSend, 4);
      // and send it to the server
      socket.write(toSend);
    });

    let result = Buffer.alloc(0);
    let respLen = null;
    socket.on("data", data => {
      result = Buffer.concat([result, data]);
      if (result.length >= 4 && ! respLen) {
        respLen = result.readUInt32BE(0);
      }
      if (respLen && result.length >= respLen) {
        if (request["$$dataload$$"]) {
          const data = result.subarray(4, 4 + respLen);
          resolve(data);
        } else {
          const encodedJson = result.toString("utf8", 4, 4 + respLen);
          const json = JSON.parse(encodedJson);
          if (json["J_STATUS"] === "J_STATUS_OK") resolve(json);
          else {
            console.warn(`[${name}] request error ${JSON.stringify(json["J_RESPONSE"])}`);
            reject(json["J_RESPONSE"]);
          }
        }
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
 * @returns {Promise<{J_STATUS: string, J_RESPONSE: {[p: string]: *}, [p: string]: *} | Buffer>} the server response
 */
export async function sendRequestAlwaysAuthenticated(req, res, name, request) {
  const loginToken = new Cookies(req, res).get("loginToken");
  if (loginToken) {
    return await sendRequestAuthenticated(req, res, name, request);
  } else {
    const accessToken = cache.get("accessToken");
    if (accessToken) request["J_API_ACCESS_TOKEN"] = accessToken;
    else request["J_API_LOGIN_TOKEN"] = process.env.LOGIN_TOKEN;

    let response;
    try {
      response = await sendRequest(name, request);
    } catch (e) {
      if (e.code === "ERROR_UNAUTHORIZED") {
        cache.del("accessToken");
        request["J_API_LOGIN_TOKEN"] = process.env.LOGIN_TOKEN
        response = await sendRequest(name, request);
      } else {
        throw e;
      }
    }
    if (typeof response["J_API_ACCESS_TOKEN"] === "string") cache.put(
      "accessToken", response["J_API_ACCESS_TOKEN"], tokenValidFor
    );
    return response;
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
 * @returns {Promise<{J_STATUS: string, J_RESPONSE: {[p: string]: *}, [p: string]: *} | Buffer>} the server response
 */
export async function sendRequestAuthenticated(req, res, name, request) {
  const cookies = new Cookies(req, res);
  const token = cookies.get("token");
  const refreshToken = cookies.get("refreshToken");
  const loginToken = cookies.get("loginToken");

  // get the tokens
  if (token) request["J_API_ACCESS_TOKEN"] = Buffer.from(token, "base64").toString();
  else if (refreshToken) request["J_API_REFRESH_TOKEN"] = Buffer.from(refreshToken, "base64").toString();
  else if (loginToken) request["J_API_LOGIN_TOKEN"] = Buffer.from(loginToken, "base64").toString();

  // get the response and set the tokens
  let response;
  try {
    response = await sendRequest(name, request);
  } catch (e) {
    if (e.code === "ERROR_UNAUTHORIZED") {
      request["J_API_LOGIN_TOKEN"] = Buffer.from(loginToken, "base64").toString()
      response = await sendRequest(name, request);
    } else throw e;
  }
  if (typeof response["J_API_ACCESS_TOKEN"] === "string") cookies.set(
    "token", Buffer.from(response["J_API_ACCESS_TOKEN"]).toString("base64"), {
      maxAge: tokenValidFor,
      sameSite: "strict",
      overwrite: true
    }
  );
  if (typeof response["J_API_REFRESH_TOKEN"] === "string") cookies.set(
    "refreshToken", Buffer.from(response["J_API_REFRESH_TOKEN"]).toString("base64"), {
      maxAge: refreshTokenValidFor,
      sameSite: "strict",
      overwrite: true
    }
  );
  if (typeof request["J_API_LOGIN_TOKEN"] === "string") cookies.set(
    "loginToken", Buffer.from(request["J_API_LOGIN_TOKEN"]).toString("base64"), {
      maxAge: refreshTokenValidFor,
      sameSite: "strict",
      overwrite: true
    }
  );
  return response;
}
export function requireArguments(req, res, args) {
  for (const arg of args) {
    if (! req.body[arg]) {
      sendMissingArguments(res);
      return true;
    }
  }
  return false;
}
export function sendMissingArguments(res) {
  return res.status(400).send({error: true, response: {
    code: "MISSING_ARGUMENT",
    messageError: "An argument is missing",
    params: []
  }});
}
export function sendError(res, response, code = 500) {
  return res.status(code).send({error: true, response});
}
export function sendErrorIfFromRemote(res, e) {
  if (typeof e.code === "string" && typeof e.messageError === "string")
    return sendError(res, e, e.code === "ERROR_UNAUTHORIZED" ? 401 : 500);
  else
    return sendError(res);
}

export default async function customRequest(req, res) {
  try {
    const data = await sendRequestAuthenticated(req, res, req.body["J_REQUEST_NAME"], req.body);
    res.send(data);
  } catch (e) {
    sendErrorIfFromRemote(res, e)
  }
}
