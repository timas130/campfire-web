import cache from "memory-cache";
import {sendRequestAlwaysAuthenticated} from "../../../lib/server";
import {sendErrorIfFromRemote} from "../../../lib/api";

export async function fetchFandoms(req, res, request = {}) {
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
    cache.put(cacheKey, resp, 120000);
    return resp;
  }
}

export default async function fandomsHandler(req, res) {
  try {
    res.send(await fetchFandoms(req, res, {offset: req.query.offset}));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
