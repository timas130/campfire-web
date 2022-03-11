import {sendErrorIfFromRemote} from "../../../lib/api";
import {sendRequestAuthenticated} from "../../../lib/server";

export async function fetchUserSettings(req, res) {
  const result = await Promise.all([
    sendRequestAuthenticated(req, res, "RAccountsGetEmail", {}),
    sendRequestAuthenticated(req, res, "RAccountsLogin", {
      tokenNotification: "",
      languageId: 0,
      translateMapHash: 0,
      translateMapHashEng: 0,
    }),
  ]);
  return {
    security: result[0].J_RESPONSE,
    account: result[1].J_RESPONSE.account,
    settings: result[1].J_RESPONSE.settings,
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
