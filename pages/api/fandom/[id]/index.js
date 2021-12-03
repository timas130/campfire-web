import {sendRequestAlwaysAuthenticated} from "../../../../lib/server";
import {sendErrorIfFromRemote} from "../../../../lib/api";

export async function fetchFandomBasic(req, res, id) {
  const fandom = sendRequestAlwaysAuthenticated(
    req, res, "RFandomsGet", {
      fandomId: id,
      languageId: 2,
      accountLanguageId: 2,
    }
  );
  return (await fandom).J_RESPONSE.fandom;
}

export async function fetchFandom(req, res, id) {
  const fandom = fetchFandomBasic(req, res, id);
  const profile = sendRequestAlwaysAuthenticated(
    req, res, "RFandomsGetProfile", {
      fandomId: id,
      languageId: 2,
    },
  );
  const info = sendRequestAlwaysAuthenticated(
    req, res, "RFandomsGetInfo", {
      fandomId: id,
      languageId: 2,
    },
  );
  return {
    fandom: await fandom,
    profile: (await profile).J_RESPONSE,
    info: (await info).J_RESPONSE,
  };
}

export default async function fandomHandler(req, res) {
  try {
    res.send(await fetchFandom(req, res, req.query.id));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
