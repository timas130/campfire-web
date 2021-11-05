/**
 * Checks if every required argument is present in the POST body
 * of the request.
 *
 * @param {IncomingMessage} req the client request (provided by next.js)
 * @param {ServerResponse} res the server response (provided by next.js)
 * @param {string[]} args list of parameters that must be present
 * @return {boolean} `true` if something is missing, `false` otherwise
 */
export function requireArguments(req, res, args) {
  for (const arg of args) {
    if (!req.body[arg]) {
      sendMissingArguments(res);
      return true;
    }
  }
  return false;
}

/**
 * Sends a `MISSING_ARGUMENT` error to the client. This uses {@link sendError}.
 * @param res the server response (provided by next.js)
 */
export function sendMissingArguments(res) {
  return sendError(res, {
    code: "MISSING_ARGUMENT",
    messageError: "An argument is missing",
    params: [],
    cweb: true,
  }, 400);
}

/**
 * Send an error to the client with HTTP code `code` and this as the body:
 * ```
 * {"error": true, "response": response}
 * ```
 * @param res the server response (provided by next.js)
 * @param {{code: string, messageError: string, params: any[]} | undefined} response object to send to the client
 * @param {number} code http status code to send
 */
export function sendError(res, response, code = 500) {
  return res.status(code).send({error: true, response});
}

/**
 * Determines if the error is an ApiException (see ZeonXX/CampfireApi)
 * and sends its contents if so. Otherwise, sends an unknown error.
 * This uses {@link sendError}.
 * @param {ServerResponse} res the server response (provided by next.js)
 * @param {any} e the error from catch
 */
export function sendErrorIfFromRemote(res, e) {
  if (typeof e.code === "string" && typeof e.messageError === "string")
    return sendError(res, e, e.code === "ERROR_UNAUTHORIZED" ? 401 : 500);
  else
    return sendError(res);
}

export function decodeDataOutput(req) {
  const dataOutput = typeof req.body.dataOutput === "string" ?
    JSON.parse(req.body.dataOutput) :
    (req.body.dataOutput || []);
  return dataOutput.map(encoded => encoded ? Buffer.from(encoded, "base64") : null);
}

export function castToBoolean(el) {
  return typeof el === "boolean" ? el : (el || "").toLowerCase() === "true";
}
