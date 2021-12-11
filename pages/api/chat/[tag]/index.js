import {sendRequestAuthenticated} from "../../../../lib/server";
import {castToChatTag, sendErrorIfFromRemote} from "../../../../lib/api";

export async function getChatInfo(req, res, tag) {
  return (await sendRequestAuthenticated(
    req, res, "RChatGet", {
      tag, messageId: 0,
    },
  )).J_RESPONSE.chat;
}

export default async function getChatHandler(req, res) {
  try {
    res.send(await getChatInfo(req, res, castToChatTag(req.query.tag)));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
