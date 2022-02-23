import {sendRequestAlwaysAuthenticated} from "../../../../../lib/server";
import {sendErrorIfFromRemote} from "../../../../../lib/api";

export async function fetchTag(req, res, tagId) {
  let tag;
  try {
    tag = (await sendRequestAlwaysAuthenticated(
      req, res, "RTagsGet", {
        tagId: parseInt(tagId),
      },
    )).J_RESPONSE.tag;
  } catch (e) { // FIXME(ext): fix this in ZeonXX/CampfireServer
    throw {
      code: "ERROR_GONE",
      messageError: "Tag not found",
      params: [],
      cweb: true,
    };
  }
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
