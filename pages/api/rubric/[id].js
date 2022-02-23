import {sendRequestAlwaysAuthenticated} from "../../../lib/server";
import {sendErrorIfFromRemote} from "../../../lib/api";

export async function fetchRubric(req, res, id, offset = 0) {
  const result = await Promise.all([
    sendRequestAlwaysAuthenticated(
      req, res, "RPostGetAllByRubric", {
        rubricId: id, offset,
      },
    ),
    offset === 0 ? sendRequestAlwaysAuthenticated(
      req, res, "RRubricGet", {
        rubricId: id,
      },
    ) : async () => {},
  ]);
  return {
    rubric: result[1] && result[1].J_RESPONSE.rubric,
    posts: result[0].J_RESPONSE.units,
  };
}

export default async function rubricHandler(req, res) {
  try {
    res.send(await fetchRubric(req, res, req.query.id, parseInt(req.query.offset) || 0));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
