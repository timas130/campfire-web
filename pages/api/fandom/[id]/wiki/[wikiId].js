import {fetchWikiList} from "./index";
import {sendErrorIfFromRemote} from "../../../../../lib/api";

export default async function wikiListHandler(req, res) {
  try {
    res.send(await fetchWikiList(req, res, req.query.id, req.query.offset, req.query.wikiId));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
