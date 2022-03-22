import {sendRequestAlwaysAuthenticated} from "../../../../lib/server";
import {sendErrorIfFromRemote} from "../../../../lib/api";

export async function fetchDonatesList(req, res, type = "month", offset = 0) {
  if (type === "month") {
    return (await sendRequestAlwaysAuthenticated(
      req, res, "RProjectDonatesGetAll", {
        offset,
      },
    )).J_RESPONSE.donates;
  } else if (type === "all") {
    return (await sendRequestAlwaysAuthenticated(
      req, res, "RProjectDonatesRatingsGetAllTotal", {
        offset,
      },
    )).J_RESPONSE.donates;
  } else {
    throw {
      code: "INVALID_TYPE",
      messageError: "allowed: month, all",
      params: [],
      cweb: true,
    };
  }
}

export default async function donatesListHandler(req, res) {
  try {
    res.send(await fetchDonatesList(req, res, req.query.type, parseInt(req.query.offset) || 0));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
