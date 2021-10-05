import {sendRequestAlwaysAuthenticated} from "../custom";

export async function fetchFandom(req, res, id) {
  const fandom = sendRequestAlwaysAuthenticated(
    req, res, "RFandomsGet", {
      fandomId: id,
      languageId: 2,
      accountLanguageId: 2,
    }
  );
  const profile = sendRequestAlwaysAuthenticated(
    req, res, "RFandomsGetProfile", {
      fandomId: id,
      languageId: 2,
    }
  );
  const info = sendRequestAlwaysAuthenticated(
    req, res, "RFandomsGetInfo", {
      fandomId: id,
      languageId: 2,
    }
  );
  const pinned = sendRequestAlwaysAuthenticated(
    req, res, "RFandomsGetPinedPost", {
      fandomId: id,
      languageId: 2,
    }
  );
  return {
    fandom: (await fandom).fandom,
    profile: await profile,
    info: await info,
    pinned: (await pinned).pinnedPost
  };
}

export default async function fandomHandler(req, res) {

}
