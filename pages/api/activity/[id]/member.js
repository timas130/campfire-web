import {sendRequestAuthenticated} from "../../../../lib/server";
import {sendErrorIfFromRemote} from "../../../../lib/api";

export async function changeActivityMemberStatus(req, res, id, member) {
  return (await sendRequestAuthenticated(
    req, res, "RActivitiesRelayRaceMember",
    {activityId: id, member},
  )).J_RESPONSE;
}

export default async function activityMemberStatusHandler(req, res) {
  try {
    res.send(await changeActivityMemberStatus(
      req, res, req.query.id,
      req.query.member.toLowerCase() === "true"
    ));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
