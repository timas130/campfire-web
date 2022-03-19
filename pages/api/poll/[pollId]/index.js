import {sendRequestAlwaysAuthenticated} from "../../../../lib/server";
import {mustInt, sendErrorIfFromRemote} from "../../../../lib/api";

export async function fetchPoll(req, res, id) {
  return (await sendRequestAlwaysAuthenticated(req, res, "RPostPagePollingGet", {
    pollingId: id,
  })).J_RESPONSE.tags;
}

export default async function pollHandler(req, res) {
  try {
    res.send(await fetchPoll(req, res, mustInt(req.query.pollId)));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
