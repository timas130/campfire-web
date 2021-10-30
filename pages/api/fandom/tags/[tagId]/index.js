import {sendRequestAlwaysAuthenticated} from "../../../../../lib/server";
import {sendErrorIfFromRemote} from "../../../../../lib/api";

export async function fetchTag(req, res, tagId) {
  const tag = (await sendRequestAlwaysAuthenticated(
    req, res, "RTagsGet", {
      tagId: parseInt(tagId),
    },
  )).J_RESPONSE.tag;
  if (typeof tag.jsonDB === "string") {
    tag.jsonDB = JSON.parse(tag.jsonDB);
  }
  return tag;
}

export default async function tagHandler(req, res) {
  try {
    res.send(await fetchTag(req, res, req.query.tagId));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
