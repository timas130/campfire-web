import {sendErrorIfFromRemote, sendRequestAuthenticated} from "../custom";

export async function fetchUserInfo(req, res) {
  return (await sendRequestAuthenticated(
    req, res, "RAccountsLoginSimple", {
      tokenNotification: ""
    }
  )).J_RESPONSE.account;
}

export default async function userInfoHandler(req, res) {
  try {
    res.send(await fetchUserInfo(req, res));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
