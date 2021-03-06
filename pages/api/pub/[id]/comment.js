import {sendRequestAuthenticated} from "../../../../lib/server";
import {castToBoolean, mustInt, requireArguments, sendErrorIfFromRemote} from "../../../../lib/api";

export async function postComment(req, res, pubId, content, reply = 0) {
  return (await sendRequestAuthenticated(
    req, res, "RCommentsCreate", {
      unitId: pubId, text: content, parentCommentId: reply,
      watchPost: false, quoteId: reply, stickerId: 0,
    }, [null],
  )).J_RESPONSE.comment;
}

export default async function commentHandler(req, res) {
  if (requireArguments(req, res, ["content"])) return;
  try {
    const result = await postComment(req, res, mustInt(req.query.id), req.body.content, req.body.reply);
    if (castToBoolean(req.query.redir)) res.redirect(302, `/post/${req.query.id}`);
    else res.send(result);
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
