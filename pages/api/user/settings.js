import {sendErrorIfFromRemote} from "../../../lib/api";
import {sendRequestAuthenticated} from "../../../lib/server";
import cache from "memory-cache";

export async function fetchUserSettings(req, res) {
  const result = await Promise.all([
    sendRequestAuthenticated(req, res, "RAccountsGetEmail", {}),
    sendRequestAuthenticated(req, res, "RAccountsLogin", {
      tokenNotification: "",
      languageId: 0,
      translateMapHash: cache.get("settings:translateMapHash") || 0,
      translateMapHashEng: cache.get("settings:translateMapHashEng") || 0,
    }),
    sendRequestAuthenticated(req, res, "RAccountsGetInfo", {
      languageId: 2,
    }),
  ]);
  cache.put("settings:translateMapHash", result[1].J_RESPONSE.translateMapHash);
  cache.put("settings:translateMapHashEng", result[1].J_RESPONSE.translateMapHashEng);
  return {
    security: result[0].J_RESPONSE,
    account: result[1].J_RESPONSE.account,
    settings: result[1].J_RESPONSE.settings,
    fandomsKarma: result[2].J_RESPONSE.fandomsIds.map(
      (id, idx) => ({
        id,
        l: result[2].J_RESPONSE.languagesIds[idx],
        k: result[2].J_RESPONSE.karmaCounts[idx],
      }),
    ),
    viceroy: result[2].J_RESPONSE.viceroyFandomsIds.map(
      (id, idx) => ({
        id,
        l: result[2].J_RESPONSE.viceroyLanguagesIds[idx],
      }),
    ),
  };
}

export default async function userSettingsHandler(req, res) {
  try {
    if (req.body && req.body.settings) {
      // Zeon moment: every call is RAccount__s__, except this one
      res.send((await sendRequestAuthenticated(req, res, "RAccountSetSettings", {
        settings: req.body.settings,
      })).J_RESPONSE);
    } else {
      res.send(await fetchUserSettings(req, res));
    }
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
