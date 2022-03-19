import {sendRequestAuthenticated} from "../../../../lib/server";
import {mustInt, requireArguments, sendErrorIfFromRemote} from "../../../../lib/api";

export async function pollVote(req, res, opts) {
  return (await sendRequestAuthenticated(req, res, "RPostPagePollingVote", opts)).J_RESPONSE;
}

export default async function pollVoteHandler(req, res) {
  if (requireArguments(req, res, ["srcType", "srcId", "srcSubId", "option"])) return;
  try {
    res.send(await pollVote(req, res, {
      sourceType: req.body.srcType,
      sourceId: req.body.srcId,
      sourceIdSub: req.body.srcSubId,
      pollingId: mustInt(req.query.pollId),
      itemId: req.body.option,
    }));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
