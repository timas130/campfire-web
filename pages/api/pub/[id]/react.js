import {sendRequestAuthenticated} from "../../../../lib/server";
import {castToBoolean, mustInt, requireArguments, sendErrorIfFromRemote} from "../../../../lib/api";

// react.js xd

export function doReact(req, res, id, reaction, set) {
  return sendRequestAuthenticated(
    req, res,
    set ? "RPublicationsReactionAdd" : "RPublicationsReactionRemove",
    {unitId: id, reactionIndex: reaction},
  ).then(a => a.J_RESPONSE);
}

export default async function reactHandler(req, res) {
  if (requireArguments(req, res, ["reaction", "set"])) return;
  try {
    res.send(await doReact(req, res, mustInt(req.query.id), mustInt(req.body.reaction), castToBoolean(req.body.set)));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
