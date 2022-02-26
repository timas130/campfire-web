import Cookies from "cookies";
import {sendRequestAuthenticated} from "../../../lib/server";
import {sendError, sendErrorIfFromRemote} from "../../../lib/api";

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
  const cookies = new Cookies(req, res);
  const token = cookies.get("token");
  const refreshToken = cookies.get("refreshToken");
  const loginToken = cookies.get("loginToken");
  if (!token && !refreshToken && !loginToken) {
    sendError(res, {
      "code": "ERROR_UNAUTHORIZED",
      "messageError": "",
      "params": [],
      "cweb": true,
    }, 401);
    return;
  }

  try {
    res.send({
      ...(await fetchUserInfo(req, res)),
      ip: req.headers["x-real-ip"] || req.headers["cf-connecting-ip"] || "{{auto}}",
    });
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
