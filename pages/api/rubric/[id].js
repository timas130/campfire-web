import {sendRequestAlwaysAuthenticated} from "../../../lib/server";
import {sendErrorIfFromRemote} from "../../../lib/api";

export async function fetchRubric(req, res, id, offset = 0) {
  const posts = sendRequestAlwaysAuthenticated(
    req, res, "RPostGetAllByRubric", {
      rubricId: id, offset,
    },
  );
  let rubric = null;
  if (offset === 0) {
    rubric = sendRequestAlwaysAuthenticated(
      req, res, "RRubricGet", {
        rubricId: id,
      },
    );
  }
  return {
    rubric: rubric && (await rubric).J_RESPONSE.rubric,
    posts: (await posts).J_RESPONSE.units,
  };
}

export default async function rubricHandler(req, res) {
  try {
    res.send(await fetchRubric(req, res, req.query.id, parseInt(req.query.offset) || 0));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
