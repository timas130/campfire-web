import {sendRequestAuthenticated} from "../../lib/server";
import {sendErrorIfFromRemote} from "../../lib/api";

export default async function customRequest(req, res) {
  try {
    const data = await sendRequestAuthenticated(req, res, req.body["J_REQUEST_NAME"], req.body);
    res.send(data);
  } catch (e) {
    sendErrorIfFromRemote(res, e)
  }
}
