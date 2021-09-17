import {requireArguments, sendErrorIfFromServer, sendRequestAuthenticated} from "../custom";
import md5 from "md5";
import Cookies from "cookies";

export default async function authLogin(req, res) {
  requireArguments(req, res, ["email", "password"]);
  const loginToken = `Email - ${req.body.email} - ${md5(req.body.password)}`;
  try {
    const cookies = new Cookies(req, res);
    const data = await sendRequestAuthenticated(
      req, res,
      "RAccountsLoginSimple", {
        "J_API_LOGIN_TOKEN": loginToken,
        "tokenNotification": ""
      }
    );
    cookies.set(
      "account",
      JSON.stringify(data.J_RESPONSE.account),
      {
        httpOnly: false,
        sameSite: "strict",
        overwrite: true
      }
    );
    res.redirect("/");
  } catch (e) {
    sendErrorIfFromServer(res, e);
  }
}
