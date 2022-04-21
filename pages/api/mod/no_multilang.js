import {sendRequestAuthenticated} from "../../../lib/server";
import {requireArguments, sendErrorIfFromRemote} from "../../../lib/api";

export function makeNotMultilingual(req, res, id, comment) {
  return sendRequestAuthenticated(
    req, res, "RPostMakeMultilingualModeratorNot", {
      unitId: id,
      comment,
    },
  ).then(a => a.J_RESPONSE);
}

export default async function makeNotMultilingualHandler(req, res) {
  if (requireArguments(req, res, ["unitId", "comment"])) return;
  try {
    res.send(await makeNotMultilingual(req, res, req.body.unitId, req.body.comment));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
