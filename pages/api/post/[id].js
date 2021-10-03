import {sendErrorIfFromRemote, sendRequestAlwaysAuthenticated} from "../custom";

export async function fetchPost(req, res, id) {
  return (await sendRequestAlwaysAuthenticated(
    req, res, "RPostGet", {unitId: id},
  )).J_RESPONSE;
}

export default async function postHandler(req, res) {
  try {
    res.send(await fetchPost(req, res, req.query.id));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
