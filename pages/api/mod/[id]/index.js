import {sendRequestAlwaysAuthenticated} from "../../../../lib/server";
import {mustInt, sendErrorIfFromRemote} from "../../../../lib/api";

export function fetchModeration(req, res, id) {
  return sendRequestAlwaysAuthenticated(
    req, res, "RFandomsModerationGet", {unitId: id},
  ).then(a => a.J_RESPONSE.unit);
}

export default async function moderationGetHandler(req, res) {
  try {
    res.send(await fetchModeration(req, res, mustInt(req.query.id)));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
