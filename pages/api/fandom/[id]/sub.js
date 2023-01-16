import {sendRequestAuthenticated} from "../../../../lib/server";
import {castToBoolean, sendErrorIfFromRemote} from "../../../../lib/api";
import {SUB_TYPE_NONE} from "../../../../components/cards/FandomCard";

export async function changeFandomSubscriptionStatus(req, res, fandomId, type, important = null) {
  await sendRequestAuthenticated(
    req, res, "RFandomsSubscribeChange", {
      fandomId, languageId: 2,
      subscriptionType: type,
      notifyImportant: important !== null ? important : type !== SUB_TYPE_NONE,
    },
  );
  return {};
}

export async function getFandomSubscriptionStatus(req, res, fandomId) {
  return (await sendRequestAuthenticated(
    // Zeon moment
    req, res, "RFandomsGetSubscribtion", {
      fandomId, languageId: 2,
    },
  )).J_RESPONSE;
}

export default async function changeFandomSubscriptionStatusHandler(req, res) {
  try {
    if (req.method === "GET") {
      res.send(await getFandomSubscriptionStatus(req, res, req.query.id));
    } else if (req.method === "POST") {
      res.send(await changeFandomSubscriptionStatus(
        req, res, req.query.id, req.query.type,
        castToBoolean(req.query.important),
      ));
    } else {
      // noinspection ExceptionCaughtLocallyJS
      throw {code: "INVALID_METHOD", messageError: "use POST or GET", params: [], cweb: true};
    }
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
