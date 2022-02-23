import {sendRequestAlwaysAuthenticated} from "../../../../lib/server";
import {sendErrorIfFromRemote} from "../../../../lib/api";

/**
 * @param {IncomingMessage} req the client request
 * @param {ServerResponse} res the server response
 * @param {string | number} acc account id or nickname
 */
export async function fetchProfile(req, res, acc) {
  // convert string to number if necessary
  // "123test" => "123test"
  // "123" => 123
  // 123 => 123
  // parseInt doesn't work because parseInt("123test") === 123
  const int = parseInt(acc);
  if (!isNaN(int) && int.toString() === acc) {
    acc = int;
  }

  const argsObject = {
    accountName: typeof acc === "string" ? acc : null,
    accountId: typeof acc === "number" ? acc : null,
  };
  const result = await Promise.all([
    sendRequestAlwaysAuthenticated(
      req, res, "RAccountsGet", argsObject,
    ),
    sendRequestAlwaysAuthenticated(
      req, res, "RAccountsGetProfile", argsObject,
    ),
  ]);
  return {
    account: result[0].J_RESPONSE.account,
    profile: result[1].J_RESPONSE,
  };
}

export default async function profileHandler(req, res) {
  try {
    res.send(await fetchProfile(req, res, req.query.id));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
