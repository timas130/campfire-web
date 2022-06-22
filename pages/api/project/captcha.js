import {sendRequest} from "../../../lib/server";
import {sendErrorIfFromRemote} from "../../../lib/api";

export function getCaptchaSiteKey() {
  return sendRequest("RAccountsGetCaptchaSiteKey", {}).then(a => a.J_RESPONSE.siteKey);
}

export default async function captchaConfigurationHandler(req, res) {
  try {
    res.send({siteKey: await getCaptchaSiteKey()});
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
