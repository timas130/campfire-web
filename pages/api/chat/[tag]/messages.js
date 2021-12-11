import {sendRequestAuthenticated} from "../../../../lib/server";
import {castToChatTag, sendErrorIfFromRemote} from "../../../../lib/api";

export async function getMessages(req, res, tag, offset = 0) {
  return (await sendRequestAuthenticated(
    req, res, "RChatMessageGetAll", {
      tag, offsetDate: offset, old: false, messageId: 0,
    },
  )).J_RESPONSE.units;
}

export default async function getMessagesHandler(req, res) {
  try {
    res.send(await getMessages(req, res, castToChatTag(req.query.tag), req.query.offset));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
