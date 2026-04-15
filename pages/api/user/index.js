import {sendRequestAuthenticated, graphql, readTokens} from "../../../lib/server";
import {sendError, sendErrorIfFromRemote} from "../../../lib/api";

export async function fetchUserInfo(req, res) {
  const {accessToken} = readTokens(req, res);
  if (!accessToken) {
    throw {code: "ERROR_UNAUTHORIZED", messageError: "Not logged in", params: [], cweb: true};
  }

  const {me} = await graphql(`query { me { id } }`, {}, accessToken);
  if (!me) {
    throw {code: "ERROR_UNAUTHORIZED", messageError: "No current user", params: [], cweb: true};
  }

  const resp = (await sendRequestAuthenticated(
    req, res, "RAccountsGet", {accountId: Number(me.id)},
  )).J_RESPONSE;

  if (!resp.account) {
    throw {code: "ERROR_UNAUTHORIZED", messageError: "account missing", params: [], cweb: true};
  }
  return resp.account;
}

export default async function userInfoHandler(req, res) {
  try {
    res.send({...(await fetchUserInfo(req, res))});
  } catch (e) {
    if (e?.code === "ERROR_UNAUTHORIZED") return sendError(res, e, 401);
    sendErrorIfFromRemote(res, e);
  }
}
