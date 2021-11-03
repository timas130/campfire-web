import {sendRequestAlwaysAuthenticated} from "../../../../lib/server";
import {sendErrorIfFromRemote} from "../../../../lib/api";

export async function fetchFandomTags(req, res, fandomId) {
  return (await sendRequestAlwaysAuthenticated(
    req, res, "RTagsGetAll", {
      fandomId,
      languageId: 2,
    },
  )).J_RESPONSE.tags;
}

export default async function fandomTagsHandler(req, res) {
  try {
    res.send(await fetchFandomTags(req, res, req.query.id));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
