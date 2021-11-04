import {sendRequestAlwaysAuthenticated} from "../../../../lib/server";
import {sendErrorIfFromRemote} from "../../../../lib/api";

export async function fetchRubrics(req, res, fandomId = 0, owner = 0, offset = 0) {
  return (await sendRequestAlwaysAuthenticated(
    req, res, "RRubricsGetAll", {
      fandomId, languageId: 2, ownerId: owner, offset,
    },
  )).J_RESPONSE.rubrics;
}

export default async function rubricsHandler(req, res) {
  try {
    res.send(await fetchRubrics(req, res, req.query.id, req.query.owner, req.query.offset));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
