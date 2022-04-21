import {sendRequestAuthenticated} from "../../../lib/server";
import {requireArguments, sendErrorIfFromRemote} from "../../../lib/api";

export function changeTags(req, res, id, tags, comment) {
  return sendRequestAuthenticated(
    req, res, "RPostPublication", {
      unitId: id,
      tags,
      comment,
    },
  ).then(a => a.J_RESPONSE);
}

export default async function changeTagsHandler(req, res) {
  if (requireArguments(req, res, ["unitId", "tags", "comment"])) return;
  try {
    res.send(await changeTags(req, res, req.body.unitId, req.body.tags, req.body.comment));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
