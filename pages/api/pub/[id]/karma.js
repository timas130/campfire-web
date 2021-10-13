import {sendRequestAuthenticated} from "../../../../lib/server";
import {sendErrorIfFromRemote} from "../../../../lib/api";
import {withSentry} from "@sentry/nextjs";

export async function setKarma(req, res, pubId, positive) {
  return (await sendRequestAuthenticated(
    req, res, "RPublicationsKarmaAdd", {
      unitId: pubId,
      up: positive,
      userLanguage: 2,
      anon: false
    },
  )).J_RESPONSE;
}

async function karmaHandler(req, res) {
  try {
    res.send(await setKarma(req, res, req.query.id, req.query.positive === "true"));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}

export default withSentry(karmaHandler);
