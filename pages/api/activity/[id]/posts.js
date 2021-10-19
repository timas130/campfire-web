import {sendRequestAlwaysAuthenticated} from "../../../../lib/server";
import {sendErrorIfFromRemote} from "../../../../lib/api";

export async function fetchActivityPosts(req, res, id, offset = 0) {
  return (await sendRequestAlwaysAuthenticated(
    req, res, "RActivitiesGetPosts", {
      userActivityId: id,
      offset,
    }
  )).J_RESPONSE.posts;
}

export default async function activityPostsHandler(req, res) {
  try {
    res.send(await fetchActivityPosts(req, res, req.query.id));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
