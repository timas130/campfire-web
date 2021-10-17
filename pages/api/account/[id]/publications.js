import {sendRequestAuthenticated} from "../../../../lib/server";
import {sendErrorIfFromRemote} from "../../../../lib/api";

export async function fetchProfilePubs(req, res, accountId, offset = 0, request = {}) {
  return (await sendRequestAuthenticated(
    req, res, "RPublicationsGetAll", {
      accountId,
      parentUnitId: 0,
      offset,
      fandomId: 0,
      fandomsIds: [],
      important: 0,
      drafts: false,
      includeZeroLanguages: true,
      includeModerationsBlocks: false,
      includeModerationsOther: false,
      includeMultilingual: true,
      unitTypes: [9, 1],
      order: 1,
      languageId: 2,
      onlyWithFandom: true,
      count: 20,
      appKey: null,
      appSubKey: null,
      tags: [],
      ...request,
    }
  )).J_RESPONSE.units;
}

export default async function profilePubsHandler(req, res) {
  try {
    res.send(await fetchProfilePubs(req, res, req.query.id, req.query.offset));z
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
