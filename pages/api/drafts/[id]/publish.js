import {sendRequestAuthenticated} from "../../../../lib/server";
import {castToBoolean, sendErrorIfFromRemote} from "../../../../lib/api";

export async function publishDraft(
  req, res,
  draftId,
  tags = [],
  notify = false,
  pendingTime = 0,
  closed = false,
  multilingual = false,
  rubricId = 0,
  userActivityId = 0,
  userActivityNextId = 0,
) {
  return (await sendRequestAuthenticated(
    req, res, "RPostPublication", {
      unitId: draftId, tags, comment: "",
      notifyFollowers: notify, pendingTime,
      closed, multilingual, rubricId, userActivityId,
      userActivityNextId,
    },
  )).J_RESPONSE;
}

export default async function publishHandler(req, res) {
  try {
    res.send(await publishDraft(
      req, res, req.query.id,
      typeof req.body.tags === "string" ? JSON.parse(req.body.tags || "[]") : req.body.tags,
      castToBoolean(req.body.notify),
      req.body.pendingTime,
      castToBoolean(req.body.closed),
      castToBoolean(req.body.multilingual),
      req.body.rubricId,
      req.body.userActivityId,
      req.body.userActivityNextId,
    ));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
