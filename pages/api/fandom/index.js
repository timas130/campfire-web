import cache from "memory-cache";
import {sendRequestAlwaysAuthenticated} from "../../../lib/server";
import {sendErrorIfFromRemote} from "../../../lib/api";

// s/o 2450954#2450976
function shuffle(array) {
  let currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

export async function fetchFandoms(req, res, request = {}) {
  const cacheKey = "/api/fandoms::" + JSON.stringify(request);
  const cachedResp = cache.get(cacheKey);
  if (cachedResp) return cachedResp;
  else {
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
        ...request
      }
    )).J_RESPONSE.fandoms;
    cache.put(cacheKey, resp, 120000);
    return resp;
  }
}

export default async function fandomsHandler(req, res) {
  try {
    if (req.query.card) {
      res.send(shuffle(await fetchFandoms(req, res)));
    } else {
      res.send(await fetchFandoms(req, res, {offset: req.query.offset}));
    }
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
