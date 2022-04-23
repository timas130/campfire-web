import {sendRequestAlwaysAuthenticated} from "../../../../lib/server";
import {castToBoolean, sendErrorIfFromRemote} from "../../../../lib/api";

export function fetchStickerPack(req, res, id, stickerId = null, getList = true) {
  return Promise.all([
    sendRequestAlwaysAuthenticated(
      req, res, "RStickersPacksGetInfo", {
        packId: id,
        stickerId,
      },
    ).then(a => a.J_RESPONSE.stickersPack),
    (getList && !stickerId) ? sendRequestAlwaysAuthenticated(
      req, res, "RStickersGetAllByPackId", {
        packId: id,
      },
    ).then(a => a.J_RESPONSE.stickers) : null,
  ]).then(result => ({
    info: result[0],
    list: result[1],
  }));
}

export default async function stickerPackHandler(req, res) {
  try {
    res.send(await fetchStickerPack(req, res, req.query.id, null, !castToBoolean(req.query.noList)));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
