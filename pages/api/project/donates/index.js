import {sendRequestAlwaysAuthenticated} from "../../../../lib/server";
import {sendErrorIfFromRemote} from "../../../../lib/api";
import {withSentry} from "@sentry/nextjs";

export async function fetchDonates(req, res) {
  return (await sendRequestAlwaysAuthenticated(
    req, res, "RProjectSupportGetInfo"
  )).J_RESPONSE;
}

async function donatesHandler(req, res) {
  try {
    res.send(await fetchDonates(req, res));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}

export default withSentry(donatesHandler);
