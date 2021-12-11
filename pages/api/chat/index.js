import {sendRequestAuthenticated} from "../../../lib/server";
import {sendErrorIfFromRemote} from "../../../lib/api";

export async function getChats(req, res, offset = 0) {
  return (await sendRequestAuthenticated(
    req, res, "RChatsGetAll", {
      offset,
    },
  )).J_RESPONSE.units;
}

export default async function getChatsHandler(req, res) {
  try {
    res.send(await getChats(req, res, req.query.offset));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
