import {sendRequestAlwaysAuthenticated} from "../../../../lib/server";
import {sendErrorIfFromRemote} from "../../../../lib/api";

export function getPinnedPost(req, res, fandomId, languageId = 2) {
  return sendRequestAlwaysAuthenticated(
    req, res, "RFandomsGetPinedPost", {
      fandomId, languageId,
    },
  ).then(a => a.J_RESPONSE.pinnedPost);
}

export default async function pinnedPostHandler(req, res) {
  try {
    res.send(await getPinnedPost(req, res, req.query.id, req.query.lang));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
