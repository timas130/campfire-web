import cache from "memory-cache";
import {sendRequestAlwaysAuthenticated} from "../../../lib/server";
import {sendErrorIfFromRemote} from "../../../lib/api";

export async function fetchFandoms(req, res, sub, request = {}) {
  if (sub) {
    return (await sendRequestAlwaysAuthenticated(
      req, res, "RFandomsGetAllSubscribed",
      {accountId: sub, ...request},
    )).J_RESPONSE.fandoms;
  }

  const cacheKey = "/api/fandoms::" + JSON.stringify(request);
  const cachedResp = cache.get(cacheKey);
  if (cachedResp) {
    return cachedResp;
  } else {
    const resp = (await sendRequestAlwaysAuthenticated(
      req, res, "RFandomsGetAll", {
        subscribedStatus: 0,
        offset: 0,
        languageId: 2,
        categoryId: 0,
        name: "",
        params1: [],
        params2: [],
        params3: [],
        params4: [],
        ...request,
      },
    )).J_RESPONSE.fandoms;
    if (!request.name) cache.put(cacheKey, resp, 120000);
    return resp;
  }
}

export default async function fandomsHandler(req, res) {
  try {
    res.send(await fetchFandoms(req, res, req.query.account, {
      offset: req.query.offset,
      name: req.query.query || "",
    }));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
