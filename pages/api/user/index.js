import Cookies from "cookies";
import {sendRequestAuthenticated} from "../../../lib/server";
import {sendError, sendErrorIfFromRemote} from "../../../lib/api";

export async function fetchUserInfo(req, res) {
  return (await sendRequestAuthenticated(
    req, res, "RAccountsLoginSimple", {
      tokenNotification: ""
    }
  )).J_RESPONSE.account;
}

export default async function userInfoHandler(req, res) {
  const cookies = new Cookies(req, res);
  const token = cookies.get("token");
  const refreshToken = cookies.get("refreshToken");
  const loginToken = cookies.get("loginToken");
  if (!token && !refreshToken && !loginToken) {
    sendError(res, {
      "code": "ERROR_UNAUTHORIZED",
      "messageError": "",
      "params": []
    }, 401);
    return;
  }

  try {
    res.send(await fetchUserInfo(req, res));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
