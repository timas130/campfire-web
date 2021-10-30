import {sendRequestAlwaysAuthenticated} from "../../../../../lib/server";
import {sendErrorIfFromRemote} from "../../../../../lib/api";

export async function fetchTagPosts(req, res, tagId, offset = 0) {
  return (await sendRequestAlwaysAuthenticated(
    req, res, "RPostGetAllByTag", {offset, tagId}
  )).J_RESPONSE.units;
}

export default async function tagPostsHandler(req, res) {
  try {
    res.send(await fetchTagPosts(req, res, req.query.tagId, req.query.offset));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
