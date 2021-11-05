import {sendRequestAlwaysAuthenticated} from "../../lib/server";
import {sendErrorIfFromRemote} from "../../lib/api";

export async function fetchFeed(req, res, type = "subscribed", offset = 0) {
  if (type === "subscribed") {
    return (await sendRequestAlwaysAuthenticated(
      req, res, "RPostFeedGetAllSubscribe", {
        offsetDate: offset,
        categoryId: 0,
      }
    )).J_RESPONSE;
  } else {
    const karmaCategory =
      type === "best" ? 2 :
      type === "good" ? 1 :
      0; // abyss
    const noSubscribes = type !== "all_subs";
    const noKarmaCategory = type === "all" || type === "all_subs";
    return (await sendRequestAlwaysAuthenticated(
      req, res, "RPostFeedGetAll", {
        offsetDate: offset,
        languagesId: [2],
        categoriesId: [],
        importantOnly: false,
        karmaCategory,
        noSubscribes,
        noKarmaCategory,
      },
    )).J_RESPONSE;
  }
}

export default async function feedHandler(req, res) {
  try {
    res.send(await fetchFeed(req, res, req.query.type, req.query.offset));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
