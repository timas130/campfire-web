import {sendRequestAlwaysAuthenticated} from "../../../../lib/server";
import {mustInt, sendErrorIfFromRemote} from "../../../../lib/api";

export async function fetchFandomPosts(req, res, fandomId, offset = 0,
                                       types = [9], request = {}) {
  return (await sendRequestAlwaysAuthenticated(
    req, res, "RPublicationsGetAll", {
      offset,
      fandomId,
      unitTypes: types,
      languageId: 2,
      count: 20,
      ...request,
    }
  )).J_RESPONSE.units;
}

export default async function fandomPostsHandler(req, res) {
  try {
    res.send(await fetchFandomPosts(
      req, res, req.query.id, req.query.offset,
      req.query.types ?
        req.query.types.split(",").map(a => mustInt(a)) :
        [9],
    ));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
