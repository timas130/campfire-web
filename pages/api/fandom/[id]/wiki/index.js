import {sendRequestAlwaysAuthenticated} from "../../../../../lib/server";
import {sendErrorIfFromRemote} from "../../../../../lib/api";

export async function fetchWiki(req, res, fandomId, offset = 0, parent = 0) {
  return (await sendRequestAlwaysAuthenticated(
    req, res, "RWikiListGet", {
      fandomId, offset,
      parentItemId: parent,
    },
  )).J_RESPONSE.items;
}

export default async function wikiRootHandler(req, res) {
  try {
    res.send(await fetchWiki(req, res, req.query.id, req.query.offset));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
