import {sendErrorIfFromRemote} from "../../../lib/api";

export default async function authLogin(req, res) {
  sendErrorIfFromRemote(res, {
    code: "ERROR_GONE",
    messageError: "Migrate to Firebase authentication.",
    params: [],
  });
}
