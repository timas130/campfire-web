import {sendRequestAlwaysAuthenticated} from "../../../../lib/server";
import {sendErrorIfFromRemote} from "../../../../lib/api";

export async function fetchActivitiesForAccount(req, res, accountId, fandomId = 0, offset = 0) {
  return (await sendRequestAlwaysAuthenticated(
    req, res, "RActivitiesGetAllForAccount", {
      accountId, fandomId, languageId: 2, offset,
    },
  )).J_RESPONSE.userActivities;
}

export default async function activitiesForAccountHandler(req, res) {
  try {
    res.send(await fetchActivitiesForAccount(req, res, req.query.id, req.query.fandom, req.query.offset));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
