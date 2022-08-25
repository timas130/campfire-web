import * as Sentry from "@sentry/nextjs";

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
    if (req.body[arg] === undefined || req.body[arg] === null) {
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
  if (typeof e?.code === "string" && typeof e?.messageError === "string") {
    return sendError(res, e, e.code === "ERROR_UNAUTHORIZED" ? 401 : 500);
  } else {
    console.warn(e);
    Sentry.captureException(e);
    return sendError(res);
  }
}

/**
 * Converts a base64-encoded `dataOutput` list to an array of {@link Buffer}s.
 * @param {{body: {dataOutput: ?string | string[]}}} req the server response (provided by next.js)
 * @returns {Buffer[]} an array of buffers containing the `dataOutput` data
 */
export function decodeDataOutput(req) {
  const dataOutput = typeof req.body.dataOutput === "string" ?
    JSON.parse(req.body.dataOutput) :
    (req.body.dataOutput || []);
  return dataOutput.map(encoded => encoded ? Buffer.from(encoded, "base64") : null);
}

/**
 * Converts a string to boolean.
 * @param {boolean | ?string} el the string (or the boolean)
 * @returns {boolean} the parsed boolean
 */
export function castToBoolean(el) {
  return typeof el === "boolean" ? el : (el || "").trim().toLowerCase() === "true";
}

export function castToChatTag(tag) {
  if (typeof tag === "object" && tag.chatType && tag.targetId && tag.targetSubId) {
    return tag;
  } else if (typeof tag === "string") {
    const parts = tag.split("-");
    if (parts.length !== 3) {
      throw {
        code: "INVALID_TAG",
        messageError: "The tag string is invalid",
        params: [],
        cweb: true,
      };
    }
    const result = {
      chatType: parseInt(parts[0]),
      targetId: parseInt(parts[1]),
      targetSubId: parseInt(parts[2]),
    };
    if (result.chatType === 2) { // private
      if (result.targetId < result.targetSubId) {
        const x = result.targetSubId;
        result.targetSubId = result.targetId;
        result.targetId = x;
      }
    }
    return result;
  } else {
    throw {
      code: "INVALID_TAG",
      messageError: "The tag is invalid",
      params: [],
      cweb: true,
    };
  }
}

export function handleSSRError(e, res, notFoundForAll = true) {
  console.warn(e);
  if (typeof e.code === "string" && typeof e.messageError === "string") {
    if (e.code === "ERROR_GONE") {
      return { notFound: true };
    } else if (e.code === "ERROR_UNAUTHORIZED") {
      return { redirect: { destination: "/auth/login", permanent: false } };
    } else if (e.code === "INVALID_INT" && e.cweb) { // seeMustInt below
      res.statusCode = 400;
      return notFoundForAll ? { notFound: true } : { props: {} };
    } else {
      res.statusCode = 500;
      return notFoundForAll ? { notFound: true } : { props: {} };
    }
  } else {
    res.statusCode = 500;
    return notFoundForAll ? { notFound: true } : { props: {} };
  }
}

export function mustInt(a) {
  const ret = parseInt(a);
  if (!isFinite(ret)) {
    throw {
      code: "INVALID_INT",
      messageError: "Failed to parse int",
      params: [a],
      cweb: true,
    };
  }
  return ret;
}
