import {sendErrorIfFromRemote} from "../../../lib/api";
import {sendRequestAuthenticated} from "../../../lib/server";

export async function fetchUserSettings(req, res) {
  const result = await Promise.all([
    sendRequestAuthenticated(req, res, "RAccountsGetEmail", {}),
  ]);
  return {
    security: result[0].J_RESPONSE,
  };
}

export default async function userSettingsHandler(req, res) {
  try {
    res.send(await fetchUserSettings(req, res));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
