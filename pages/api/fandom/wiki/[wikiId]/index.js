import {sendRequestAlwaysAuthenticated} from "../../../../../lib/server";
import {sendErrorIfFromRemote} from "../../../../../lib/api";

export async function fetchWikiItem(req, res, wikiId) {
  const result = await Promise.all([
    sendRequestAlwaysAuthenticated(
      req, res, "RWikiGetPages", {
        itemId: wikiId,
        languageId: 2,
      },
    ),
    (async () => {
      try {
        return await sendRequestAlwaysAuthenticated(
          req, res, "RWikiGet", {
            itemId: wikiId,
          },
        );
      } catch (e) { // FIXME(ext): fix this in ZeonXX/CampfireServer
        throw {
          code: "ERROR_GONE",
          messageError: "Article not found",
          params: [],
          cweb: true,
        };
      }
    })(),
  ]);
  return {
    pages: result[0].J_RESPONSE.wikiPages,
    item: result[1].J_RESPONSE.item,
  };
}

export default async function wikiItemHandler(req, res) {
  try {
    res.send(await fetchWikiItem(req, res, req.query.wikiId));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
