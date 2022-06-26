import {sendRequestAlwaysAuthenticated} from "../../../lib/server";
import {mustInt, sendErrorIfFromRemote} from "../../../lib/api";
import cache from "memory-cache";

export async function fetchRubric(req, res, id, offset = 0) {
  const cachedRubric = cache.get(`/api/rubric/${id}`);
  const result = await Promise.all([
    offset !== -1 ? sendRequestAlwaysAuthenticated(
      req, res, "RPostGetAllByRubric", {
        rubricId: id, offset,
      },
    ) : (async () => {})(),
    (offset <= 0 && !cachedRubric) ? sendRequestAlwaysAuthenticated(
      req, res, "RRubricGet", {
        rubricId: id,
      },
    ) : (async () => {})(),
  ]);
  if (result[1]) cache.put(`/api/rubric/${id}`, result[1], 3600000);
  return {
    rubric: result[1] ? result[1].J_RESPONSE.rubric : cachedRubric?.J_RESPONSE?.rubric,
    posts: result[0] && result[0].J_RESPONSE.units,
    rubricCached: offset <= 0 && !result[1],
  };
}

export default async function rubricHandler(req, res) {
  try {
    res.send(await fetchRubric(req, res, mustInt(req.query.id), parseInt(req.query.offset) || 0));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
