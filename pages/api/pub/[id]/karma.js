import {sendRequestAlwaysAuthenticated, sendRequestAuthenticated} from "../../../../lib/server";
import {castToBoolean, sendErrorIfFromRemote} from "../../../../lib/api";

export async function setKarma(req, res, pubId, positive, anon) {
  return (await sendRequestAuthenticated(
    req, res, "RPublicationsKarmaAdd", {
      unitId: pubId,
      up: positive,
      userLanguage: 2,
      anon,
    },
  )).J_RESPONSE;
}

export async function getKarmaList(req, res, pubId, offset = 0) {
  return (await sendRequestAlwaysAuthenticated(
    req, res, "RPostRatesGetAll", {
      unitId: pubId,
      offset,
    },
  )).J_RESPONSE.rates;
}

export default async function karmaHandler(req, res) {
  try {
    if (req.method === "GET") {
      res.send(await getKarmaList(req, res, req.query.id, parseInt(req.query.offset) || 0));
    } else if (req.method === "POST") {
      res.send(await setKarma(
        req, res, req.query.id,
        castToBoolean(req.query.positive),
        castToBoolean(req.query.anon),
      ));
    } else {
      // noinspection ExceptionCaughtLocallyJS
      throw {code: "INVALID_METHOD", messageError: "use POST", params: [], cweb: true};
    }
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
