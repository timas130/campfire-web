import {requireArguments, sendErrorIfFromRemote} from "../../../lib/api";
import {sendRequestAuthenticated} from "../../../lib/server";
import Cookies from "cookies";
import * as crypto from "crypto";

export async function changePassword(req, res, oldPassword, newPassword) {
  const cookies = new Cookies(req, res);
  const loginToken = Buffer.from(cookies.get("loginToken"), "base64").toString();
  const email = loginToken.split(" - ")[1];
  const newPasswordHash = crypto.createHash("sha512").update(newPassword).digest("hex");

  const newLoginTokenB64 = Buffer.from(`Email - ${email} - ${newPasswordHash}`)
    .toString("base64");

  cookies.set(
    "loginToken", newLoginTokenB64, {
      maxAge: 365 * 24 * 3600000,
      sameSite: "strict",
      overwrite: true,
    },
  );

  return (await sendRequestAuthenticated(
    req, res, "RAccountsChangePassword", {
      email,
      oldPassword: crypto.createHash("sha512")
        .update(oldPassword).digest("hex"),
      newPassword: newPasswordHash,
    },
  )).J_RESPONSE;
}

export default async function changePasswordHandler(req, res) {
  if (requireArguments(req, res, ["old", "new"])) return;
  try {
    res.send(await changePassword(req, res, req.body.old, req.body.new));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
