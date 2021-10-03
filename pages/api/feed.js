import {sendErrorIfFromRemote, sendRequestAlwaysAuthenticated} from "./custom";

export async function fetchFeed(req, res, offset = 0) {
  return (await sendRequestAlwaysAuthenticated(
    req, res, "RPostFeedGetAllSubscribe", {
      offsetDate: offset,
      categoryId: 0
    }
  ))["J_RESPONSE"];
}

export default async function feedHandler(req, res) {
  try {
    res.send(await fetchFeed(req, res, req.query.offset));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
