import crypto from "crypto";
import {sendRequest, sendRequestAlwaysAuthenticated, sendRequestAuthenticated} from "../../../lib/server";
import {castToBoolean, requireArguments, sendErrorIfFromRemote} from "../../../lib/api";
import {logout} from "./logout";

const allowedA = "qwertyuiopasdfghjklzxcvbnm";
const allowed = allowedA + allowedA.toUpperCase() + "0123456789";

export function checkNickname(nickname) {
  if (nickname.length < 3 || nickname.length > 25) {
    throw {
      code: "E_LOGIN_LENGTH",
      messageError: "invalid nickname length",
      params: [3, 25],
      cweb: true,
    };
  }

  for (let i = 0; i < nickname.length; i++) {
    const char = nickname.charAt(i);
    if (!allowed.includes(char)) {
      throw {
        code: "E_LOGIN_CHARS",
        messageError: "allowed chars: %s",
        params: [allowed],
        cweb: true,
      };
    }
  }
}

export async function doEmailRegister(req, res, email, password, captcha, nickname) {
  checkNickname(nickname);

  let exists = false;
  try {
    await sendRequestAlwaysAuthenticated(
      req, res, "RAccountsGet",
      {accountName: nickname},
    );
  } catch (e) {
    if (e?.code === "ERROR_GONE") exists = true;
  }
  if (exists) {
    throw {
      code: "E_LOGIN_NOT_ENABLED",
      messageError: "this nickname already exists",
      params: [],
      cweb: true,
    };
  }

  logout(req, res);
  const hash = crypto.createHash("sha512");
  hash.update(password);
  const digest = hash.digest("hex");

  const accountId = (await sendRequest("RAccountsRegistrationEmail", {
    email,
    password: digest,
    languageId: 2,
    captchaResp: captcha,
  })).J_RESPONSE.accountId;

  // noinspection ES6MissingAwait // I hate this
  const loginToken = `Email - ${email} - ${digest}`;
  await sendRequestAuthenticated(req, res, "RAccountsChangeName", {
    name: nickname,
    achievementNotificationEnabled: false,
    J_API_LOGIN_TOKEN: loginToken,
  });
  return accountId;
}

export default async function emailRegisterHandler(req, res) {
  if (requireArguments(req, res, ["email", "password", "h-captcha-response", "nickname", "rules-agree"])) return;
  try {
    if (req.body["rules-agree"] !== "on") {
      throw {
        code: "E_TERMS",
        messageError: "you must agree to the terms",
        params: [],
        cweb: true,
      };
    }
    const accountId = await doEmailRegister(
      req, res, req.body.email, req.body.password,
      req.body["h-captcha-response"], req.body.nickname,
    );
    if (castToBoolean(req.body.redir)) {
      res.redirect(302, "/auth/welcome");
    } else {
      res.send({accountId});
    }
  } catch (e) {
    logout(req, res);
    sendErrorIfFromRemote(res, e);
  }
}
