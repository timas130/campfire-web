import {sendErrorIfFromRemote, sendRequestAlwaysAuthenticated} from "../../custom";

export async function fetchDonates(req, res) {
  return (await sendRequestAlwaysAuthenticated(
    req, res, "RProjectSupportGetInfo"
  )).J_RESPONSE;
}

export default async function donatesHandler(req, res) {
  try {
    res.send(await fetchDonates(req, res));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
