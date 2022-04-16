import {sendRequestAlwaysAuthenticated} from "../../../../lib/server";
import {castToBoolean, sendErrorIfFromRemote} from "../../../../lib/api";

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
  const result = await Promise.all([
    fetchFandomBasic(req, res, id),
    sendRequestAlwaysAuthenticated(
      req, res, "RFandomsGetProfile", {
        fandomId: id,
        languageId: 2,
      },
    ),
    (async () => {
      try {
        return await sendRequestAlwaysAuthenticated(
          req, res, "RFandomsGetInfo", {
            fandomId: id,
            languageId: 2,
          },
        );
      } catch (e) { // FIXME(ext): fix this in ZeonXX/CampfireServer
        throw {
          code: "ERROR_GONE",
          messageError: "Article not found",
          params: [],
          cweb: true,
        };
      }
    })(),
  ]);
  return {
    fandom: result[0],
    profile: result[1].J_RESPONSE,
    info: result[2].J_RESPONSE,
  };
}

export default async function fandomHandler(req, res) {
  try {
    if (castToBoolean(req.query.basic)) {
      res.send({fandom: await fetchFandomBasic(req, res, req.query.id)});
    } else {
      res.send(await fetchFandom(req, res, req.query.id));
    }
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
