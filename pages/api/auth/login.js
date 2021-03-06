import * as crypto from "crypto";
import {sendRequestAuthenticated} from "../../../lib/server";
import {requireArguments, sendErrorIfFromRemote} from "../../../lib/api";
import {logout} from "./logout";

export default async function authLogin(req, res) {
  if (requireArguments(req, res, ["email", "password"])) return;
  const hash = crypto.createHash("sha512");
  hash.update(req.body.password);
  const loginToken = `Email - ${req.body.email} - ${hash.digest("hex")}`;
  try {
    logout(req, res);
    const resp = await sendRequestAuthenticated(
      req, res,
      "RAccountsLoginSimple", {
        "J_API_LOGIN_TOKEN": loginToken,
        "tokenNotification": "",
      }
    );
    if (!resp.J_RESPONSE.account) {
      // problem?
      // noinspection ExceptionCaughtLocallyJS
      throw {
        code: "ERROR_UNAUTHORIZED",
        messageError: "Remote returned account=null",
        params: [],
        cweb: true,
        response: resp.J_RESPONSE,
      };
    }

    if (req.body.redir.toString().toLowerCase() !== "false") {
      res.redirect(302, "/");
    } else {
      res.send(resp.J_RESPONSE);
    }
  } catch (e) {
    logout(req, res);
    if ("redir" in req.body && req.body.redir.toString().toLowerCase() === "false") {
      sendErrorIfFromRemote(res, e);
      return;
    }

    if (e.code === "ERROR_UNAUTHORIZED") res.redirect(302, "/auth/login?error=unauthorized");
    else res.redirect(302, "/auth/login?error=unknown");
  }
}
