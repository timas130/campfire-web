import {sendRequestAuthenticated} from "../../../../lib/server";
import {sendErrorIfFromRemote} from "../../../../lib/api";
import {SUB_TYPE_NONE} from "../../../../components/cards/FandomCard";

export async function changeFandomSubscriptionStatus(req, res, fandomId, type) {
  await sendRequestAuthenticated(
    req, res, "RFandomsSubscribeChange", {
      fandomId, languageId: 2,
      subscriptionType: type,
      notifyImportant: type !== SUB_TYPE_NONE,
    },
  );
  return {ok: "👌"}; // yes i am very funny
}

export default async function changeFandomSubscriptionStatusHandler(req, res) {
  try {
    res.send(await changeFandomSubscriptionStatus(req, res, req.query.id, req.query.type));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
