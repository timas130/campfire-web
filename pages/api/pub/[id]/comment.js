import {sendRequestAuthenticated} from "../../../../lib/server";
import {requireArguments, sendErrorIfFromRemote} from "../../../../lib/api";
import {withSentry} from "@sentry/nextjs";

export async function postComment(req, res, pubId, content, reply = 0) {
  return (await sendRequestAuthenticated(
    req, res, "RCommentsCreate", {
      unitId: pubId, text: content, parentCommentId: reply,
      watchPost: false, quoteId: reply, stickerId: 0,
    },
  )).J_RESPONSE.comment;
}

async function commentHandler(req, res) {
  requireArguments(req, res, ["content"]);
  try {
    const result = await postComment(req, res, req.query.id, req.body.content, req.body.reply);
    if (req.query.redir) res.redirect(`/pub/${req.query.id}`);
    else res.send(result);
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}

export default withSentry(commentHandler);
