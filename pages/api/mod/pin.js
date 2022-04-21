import {sendRequestAuthenticated} from "../../../lib/server";
import {requireArguments, sendErrorIfFromRemote} from "../../../lib/api";

export function pinPost(req, res, postId, fandomId, languageId, comment) {
  return sendRequestAuthenticated(
    req, res, "RPostPinFandom", {
      postId, fandomId, languageId, comment,
    },
  ).then(a => a.J_RESPONSE);
}

export default async function pinPostHandler(req, res) {
  if (requireArguments(req, res, ["postId", "fandomId", "languageId", "comment"])) return;
  try {
    res.send(await pinPost(req, res, req.body.postId, req.body.fandomId, req.body.languageId, req.body.comment));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
