import {sendRequestAlwaysAuthenticated} from "../../../../lib/server";
import {sendErrorIfFromRemote} from "../../../../lib/api";

export async function fetchPost(req, res, id) {
  const resp = (await sendRequestAlwaysAuthenticated(
    req, res, "RPostGet", {unitId: id},
  )).J_RESPONSE;
  if (typeof resp.unit.jsonDB === "string") {
    resp.unit.jsonDB = JSON.parse(resp.jsonDB);
  }
  return resp;
}

export default async function postHandler(req, res) {
  try {
    res.send(await fetchPost(req, res, req.query.id));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
