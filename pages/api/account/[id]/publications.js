import {sendRequestAlwaysAuthenticated} from "../../../../lib/server";
import {mustInt, sendErrorIfFromRemote} from "../../../../lib/api";

export async function fetchProfilePubs(req, res, accountId, offset = 0, types = [9, 1]) {
  return (await sendRequestAlwaysAuthenticated(
    req, res, "RPublicationsGetAll", {
      accountId,
      offset,
      unitTypes: types,
      count: 20,
      includeModerationsBlocks: true,
      includeModerationsOther: true,
    }
  )).J_RESPONSE.units;
}

export default async function profilePubsHandler(req, res) {
  try {
    res.send(await fetchProfilePubs(
      req, res, req.query.id, req.query.offset,
      req.query.types ?
        req.query.types.split(",").map(a => mustInt(a)) :
        [9, 1],
    ));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
