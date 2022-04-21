import {sendRequestAuthenticated} from "../../../lib/server";
import {requireArguments, sendErrorIfFromRemote} from "../../../lib/api";

export function moveToDrafts(req, res, id, comment) {
  return sendRequestAuthenticated(
    req, res, "RFandomsModerationToDrafts", {
      unitId: id,
      comment,
    },
  ).then(a => a.J_RESPONSE);
}

export default async function toDraftsHandler(req, res) {
  if (requireArguments(req, res, ["unitId", "comment"])) return;
  try {
    res.send(await moveToDrafts(req, res, req.body.unitId, req.body.comment));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
