import md5 from "md5";
import {sendRequestAuthenticated} from "../../../lib/server";
import {requireArguments} from "../../../lib/api";

export default async function authLogin(req, res) {
  requireArguments(req, res, ["email", "password"]);
  const loginToken = `Email - ${req.body.email} - ${md5(req.body.password)}`;
  try {
    await sendRequestAuthenticated(
      req, res,
      "RAccountsLoginSimple", {
        "J_API_LOGIN_TOKEN": loginToken,
        "tokenNotification": ""
      }
    );
    res.redirect("/");
  } catch (e) {
    if (e.code === "ERROR_UNAUTHORIZED") res.redirect("/auth/login?error=unauthorized");
    else res.redirect("/auth/login?error=unknown");
  }
}
