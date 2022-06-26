import {sendRequestAlwaysAuthenticated} from "../../../../../lib/server";
import {sendErrorIfFromRemote} from "../../../../../lib/api";

export async function fetchTagPosts(req, res, tagId, offset = 0) {
  return (await sendRequestAlwaysAuthenticated(
    req, res, "RPostGetAllByTag", {offset, tagId}
  )).J_RESPONSE.units.filter(a => a.unitType === 9);
  // see: https://campfire.moe/api/fandom/207/tags/55300/posts
  // see: https://data.sit.sh/share/issue/b6e085571d814996a947ed904cb2fcbe/
}

export default async function tagPostsHandler(req, res) {
  try {
    res.send(await fetchTagPosts(req, res, req.query.tagId, req.query.offset));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
