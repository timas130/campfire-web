import {sendRequestAlwaysAuthenticated} from "../../../../lib/server";
import {sendErrorIfFromRemote} from "../../../../lib/api";
import {withSentry} from "@sentry/nextjs";

export async function fetchComments(req, res, postId, offset = 0, request = {}) {
  return (await sendRequestAlwaysAuthenticated(
    req, res, "RCommentsGetAll", {
      unitId: postId,
      offsetDate: offset,
      old: false,
      startFromBottom: false,
      ...request
    }
  )).J_RESPONSE.units;
}

async function commentsHandler(req, res) {
  try {
    res.send(await fetchComments(req, res, req.query.id, req.query.offset));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}

export default withSentry(commentsHandler);
