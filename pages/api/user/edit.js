import {mustInt, requireArguments, sendErrorIfFromRemote} from "../../../lib/api";
import {sendRequestAuthenticated} from "../../../lib/server";

export async function editAccountProp(req, res, type, value) {
  switch (type) {
    case "age":
      return (await sendRequestAuthenticated(
        req, res, "RAccountsBioSetAge", {age: mustInt(value)},
      )).J_RESPONSE;
    case "status":
      return (await sendRequestAuthenticated(
        req, res, "RAccountsStatusSet", {status: value},
      )).J_RESPONSE;
    case "description":
      return (await sendRequestAuthenticated(
        req, res, "RAccountsBioSetDescription", {description: value},
      )).J_RESPONSE;
    case "sex":
      return (await sendRequestAuthenticated(
        req, res, "RAccountsBioSetSex", {sex: value},
      )).J_RESPONSE;
    default:
      throw {
        code: "INVALID_PROP",
        messageError: "Invalid account prop",
        params: [type],
        cweb: true,
      };
  }
}

export default async function editAccountPropHandler(req, res) {
  if (requireArguments(req, res, ["prop", "value"])) return;
  try {
    res.send(await editAccountProp(req, res, req.body.prop, req.body.value));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
