import {sendRequestAuthenticated} from "../../../../lib/server";
import {decodeDataOutput, sendErrorIfFromRemote} from "../../../../lib/api";

export async function pageAction(req, res, draftId, action, args, dataOutput = []) {
  switch (action) {
    case "put":
      return (await sendRequestAuthenticated(
        req, res, "RPostPutPage", {
          unitId: draftId,
          appKey: "",
          appSubKey: "",
          ...args, // fandomId, languageId, pages
        }, dataOutput,
      )).J_RESPONSE;
    case "remove":
      return (await sendRequestAuthenticated(
        req, res, "RPostRemovePage", {
          unitId: draftId,
          ...args, // pageIndexes
        },
      )).J_RESPONSE;
    case "move":
      return (await sendRequestAuthenticated(
        req, res, "RPostMovePage", {
          unitId: draftId,
          ...args, // pageIndex, targetIndex
        },
      )).J_RESPONSE;
    case "change":
      return (await sendRequestAuthenticated(
        req, res, "RPostChangePage", {
          unitId: draftId,
          ...args, // page, pageIndex
        }, dataOutput,
      )).J_RESPONSE.page;
    default:
      throw {code: "INVALID_ACTION", messageError: "", params: [], cweb: true};
  }
}

export default async function pageHandler(req, res) {
  try {
    res.send(await pageAction(req, res, req.query.id, req.query.action, req.body, decodeDataOutput(req)));
  } catch (e) {
    console.error(e);
    sendErrorIfFromRemote(res, e);
  }
}
