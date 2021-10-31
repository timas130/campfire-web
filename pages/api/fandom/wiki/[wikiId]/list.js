import {sendErrorIfFromRemote} from "../../../../../lib/api";
import {fetchWiki} from "../../[id]/wiki";

export default async function wikiListHandler(req, res) {
  try {
    res.send(await fetchWiki(req, res, req.query.id, req.query.offset, req.query.wikiId));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
