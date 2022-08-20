import {sendRequestAuthenticated} from "../../../lib/server";
import {requireArguments, sendErrorIfFromRemote} from "../../../lib/api";

export function changeNickname(req, res, nickname) {
  return sendRequestAuthenticated(req, res, "RAccountsChangeName", {
    name: nickname,
    achievementNotificationEnabled: false,
  }).then(a => a.J_RESPONSE);
}

export default async function changeNicknameHandler(req, res) {
  if (requireArguments(req, res, ["nickname"])) return;
  try {
    res.send(await changeNickname(req, res, req.body.nickname.trim()));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
