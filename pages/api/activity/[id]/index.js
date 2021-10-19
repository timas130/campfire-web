import {sendRequestAlwaysAuthenticated} from "../../../../lib/server";
import {sendErrorIfFromRemote} from "../../../../lib/api";

export async function fetchActivity(req, res, id) {
  return (await sendRequestAlwaysAuthenticated(
    req, res, "RActivitiesGet", {
      userActivityId: id,
    },
  )).J_RESPONSE.userActivity;
}

export default async function activityHandler(req, res) {
  try {
    res.send(await fetchActivity(req, res, req.query.id));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
