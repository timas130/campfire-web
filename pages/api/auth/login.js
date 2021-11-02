import md5 from "md5";
import {sendRequestAuthenticated} from "../../../lib/server";
import {requireArguments} from "../../../lib/api";

export default async function authLogin(req, res) {
  if (requireArguments(req, res, ["email", "password"])) return;
  const loginToken = `Email - ${req.body.email} - ${md5(req.body.password)}`;
  try {
    const resp = await sendRequestAuthenticated(
      req, res,
      "RAccountsLoginSimple", {
        "J_API_LOGIN_TOKEN": loginToken,
        "tokenNotification": ""
      }
    );
    if (!resp.J_RESPONSE.account) {
      // problem?
      // noinspection ExceptionCaughtLocallyJS
      throw {code: "ERROR_UNAUTHORIZED", cweb: true};
    }

    if (req.body.redir.toLowerCase() !== "false") {
      res.redirect("/");
    } else {
      res.send(resp.J_RESPONSE);
    }
  } catch (e) {
    if (e.code === "ERROR_UNAUTHORIZED") res.redirect("/auth/login?error=unauthorized");
    else res.redirect("/auth/login?error=unknown");
  }
}
