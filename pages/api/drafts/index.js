import {sendRequestAuthenticated} from "../../../lib/server";
import {sendErrorIfFromRemote} from "../../../lib/api";

export async function fetchDrafts(req, res, offset = 0) {
  return (await sendRequestAuthenticated(
    req, res, "RPublicationsDraftsGetAll", {
      fandomId: 0,
      projectKey: "",
      projectSubKey: "",
      offset,
    },
  )).J_RESPONSE.units;
}

export default async function draftsHandler(req, res) {
  try {
    res.send(await fetchDrafts(req, res, req.query.offset));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
