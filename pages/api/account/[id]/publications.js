import {sendRequestAlwaysAuthenticated} from "../../../../lib/server";
import {sendErrorIfFromRemote} from "../../../../lib/api";

export async function fetchProfilePubs(req, res, accountId, offset = 0, request = {}) {
  return (await sendRequestAlwaysAuthenticated(
    req, res, "RPublicationsGetAll", {
      accountId,
      offset,
      unitTypes: [9, 1, 11],
      languageId: 2,
      count: 20,
      ...request,
    }
  )).J_RESPONSE.units;
}

export default async function profilePubsHandler(req, res) {
  try {
    res.send(await fetchProfilePubs(req, res, req.query.id, req.query.offset));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
