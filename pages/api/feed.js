import {sendRequestAlwaysAuthenticated} from "../../lib/server";
import {sendErrorIfFromRemote} from "../../lib/api";
import {withSentry} from "@sentry/nextjs";

export async function fetchFeed(req, res, offset = 0) {
  return (await sendRequestAlwaysAuthenticated(
    req, res, "RPostFeedGetAllSubscribe", {
      offsetDate: offset,
      categoryId: 0
    }
  ))["J_RESPONSE"];
}

async function feedHandler(req, res) {
  try {
    res.send(await fetchFeed(req, res, req.query.offset));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}

export default withSentry(feedHandler);
