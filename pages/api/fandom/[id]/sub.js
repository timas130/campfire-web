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

export default async function changeFandomSubscriptionStatusHandler(req, res) {
  try {
    res.send(await changeFandomSubscriptionStatus(
      req, res, req.query.id, req.query.type,
      castToBoolean(req.query.important),
    ));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
