import {sendRequestAlwaysAuthenticated} from "../../../../../lib/server";
import {sendErrorIfFromRemote} from "../../../../../lib/api";

export async function fetchWikiItem(req, res, wikiId) {
  const pages = sendRequestAlwaysAuthenticated(
    req, res, "RWikiGetPages", {
      itemId: wikiId,
      languageId: 2,
    },
  );
  const item = sendRequestAlwaysAuthenticated(
    req, res, "RWikiGet", {
      itemId: wikiId,
    },
  );
  return {
    pages: (await pages).J_RESPONSE.wikiPages,
    item: (await item).J_RESPONSE.item,
  };
}

export default async function wikiItemHandler(req, res) {
  try {
    res.send(await fetchWikiItem(req, res, req.query.wikiId));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
