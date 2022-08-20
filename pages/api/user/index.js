import {sendRequestAuthenticated} from "../../../lib/server";
import {sendErrorIfFromRemote} from "../../../lib/api";

export async function fetchUserInfo(req, res) {
  const resp = (await sendRequestAuthenticated(
    req, res, "RAccountsLoginSimple", {
      tokenNotification: "",
    },
  )).J_RESPONSE;
  if (!resp.account) {
    throw {
      code: "ERROR_UNAUTHORIZED",
      messageError: "Remote returned account=null",
      params: [],
      cweb: true,
      response: resp,
    };
  }
  return resp.account;
}

export default async function userInfoHandler(req, res) {
  try {
    res.send({
      ...(await fetchUserInfo(req, res)),
    });
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
