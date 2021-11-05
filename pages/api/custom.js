import {sendRequestAuthenticated} from "../../lib/server";
import {decodeDataOutput, sendErrorIfFromRemote} from "../../lib/api";

export default async function customRequest(req, res) {
  try {
    const data = await sendRequestAuthenticated(
      req, res, req.body["J_REQUEST_NAME"], req.body,
      decodeDataOutput(req),
    );
    res.send(data);
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
