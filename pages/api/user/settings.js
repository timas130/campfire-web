import {sendErrorIfFromRemote} from "../../../lib/api";
import {sendRequestAuthenticated, graphql, readTokens} from "../../../lib/server";
import cache from "memory-cache";

export async function fetchUserSettings(req, res) {
  const {accessToken} = readTokens(req, res);
  const [meData, loginResp, infoResp] = await Promise.all([
    graphql(`query { me { email } }`, {}, accessToken),
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
  cache.put("settings:translateMapHash", loginResp.J_RESPONSE.translateMapHash);
  cache.put("settings:translateMapHashEng", loginResp.J_RESPONSE.translateMapHashEng);
  return {
    security: {
      email: meData?.me?.email || null,
      google: null,
    },
    account: loginResp.J_RESPONSE.account,
    settings: loginResp.J_RESPONSE.settings,
    fandomsKarma: infoResp.J_RESPONSE.fandomsIds.map(
      (id, idx) => ({
        id,
        l: infoResp.J_RESPONSE.languagesIds[idx],
        k: infoResp.J_RESPONSE.karmaCounts[idx],
      }),
    ),
    viceroy: infoResp.J_RESPONSE.viceroyFandomsIds.map(
      (id, idx) => ({
        id,
        l: infoResp.J_RESPONSE.viceroyLanguagesIds[idx],
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
