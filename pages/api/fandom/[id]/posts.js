import {sendRequestAuthenticated} from "../../../../lib/server";
import {sendErrorIfFromRemote} from "../../../../lib/api";

export async function fetchFandomPosts(req, res, fandomId, offset = 0,
                                       types = [9], request = {}) {
  return (await sendRequestAuthenticated(
    req, res, "RPublicationsGetAll", {
      accountId: 0,
      parentUnitId: 0,
      offset,
      fandomId,
      fandomsIds: [],
      important: 0,
      drafts: false,
      includeZeroLanguages: false,
      includeModerationsBlocks: false,
      includeModerationsOther: false,
      includeMultilingual: true,
      unitTypes: types,
      order: 1,
      languageId: 2,
      onlyWithFandom: true,
      count: 20,
      appKey: "",
      appSubKey: "",
      tags: [],
      ...request,
    }
  )).J_RESPONSE.units;
}

export default async function fandomPostsHandler(req, res) {
  try {
    res.send(await fetchFandomPosts(req, res, req.query.id, req.query.offset));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
