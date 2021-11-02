import {sendRequestAuthenticated} from "../../../../lib/server";
import {sendErrorIfFromRemote} from "../../../../lib/api";

export async function fetchDraft(req, res, id) {
  return (await sendRequestAuthenticated(
    req, res, "RPostGetDraft", {unitId: id},
  )).J_RESPONSE.unit;
}

export default async function draftHandler(req, res) {
  try {
    res.send(await fetchDraft(req, res, req.query.id));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
