import {sendRequestAuthenticated} from "../../../lib/server";
import {requireArguments, sendErrorIfFromRemote} from "../../../lib/api";

export function blockPublication(req, res, opts = {}) {
  return sendRequestAuthenticated(
    req, res, "RFandomsModerationBlock", {
      ...opts,
    },
  ).then(a => a.J_RESPONSE);
}

export default async function blockPublicationHandler(req, res) {
  if (requireArguments(req, res, ["unitId"])) return;
  try {
    res.send(await blockPublication(req, res, req.body));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
