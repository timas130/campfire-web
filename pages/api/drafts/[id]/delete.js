import {sendRequestAuthenticated} from "../../../../lib/server";
import {requireArguments, sendErrorIfFromRemote} from "../../../../lib/api";

export function deleteDraft(req, res, id) {
  return sendRequestAuthenticated(
    req, res, "RPublicationsRemove", {
      unitId: id,
    },
  ).then(a => a.J_RESPONSE);
}

export default async function deleteDraftHandler(req, res) {
  if (requireArguments(req, res, [])) return;
  try {
    res.send(await deleteDraft(req, res, req.query.id));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
