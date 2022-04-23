import {sendRequestAlwaysAuthenticated} from "../../../lib/server";
import {sendErrorIfFromRemote} from "../../../lib/api";

export function fetchPopularStickers(req, res, offset) {
  return sendRequestAlwaysAuthenticated(
    req, res, "RStickersSearch", {
      offset,
    },
  ).then(a => a.J_RESPONSE.stickersPacks);
}

export default async function popularStickersHandler(req, res) {
  try {
    res.send(await fetchPopularStickers(req, res, req.query.offset));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
