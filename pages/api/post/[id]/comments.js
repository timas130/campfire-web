import {sendRequestAlwaysAuthenticated} from "../../../../lib/server";
import {sendErrorIfFromRemote} from "../../../../lib/api";

export async function fetchComments(req, res, postId, offset = 0, request = {}) {
  return (await sendRequestAlwaysAuthenticated(
    req, res, "RCommentsGetAll", {
      unitId: postId,
      offsetDate: offset,
      old: false,
      startFromBottom: false,
      ...request,
    }
  )).J_RESPONSE.units;
}

export default async function commentsHandler(req, res) {
  try {
    res.send(await fetchComments(req, res, req.query.id, req.query.offset));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
