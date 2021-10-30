import {sendRequestAuthenticated} from "../../../../lib/server";
import {sendErrorIfFromRemote} from "../../../../lib/api";

export async function rejectActivity(req, res, id) {
  return (await sendRequestAuthenticated(
    req, res, "RActivitiesRelayRaceReject", {
      activityId: id,
      nextAccountId: 0,
    },
  )).J_RESPONSE;
}

export default async function rejectActivityHandler(req, res) {
  try {
    res.send(await rejectActivity(req, res, req.query.id));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
