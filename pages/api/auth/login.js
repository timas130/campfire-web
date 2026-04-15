import {graphql, writeTokens} from "../../../lib/server";
import Cookies from "cookies";
import {requireArguments, sendErrorIfFromRemote} from "../../../lib/api";

export default async function loginHandler(req, res) {
  if (req.method !== "POST") return res.status(405).send({error: true});
  if (requireArguments(req, res, ["email", "password"])) return;

  try {
    const data = await graphql(
      `mutation Login($input: LoginEmailInput!) {
         loginEmail(input: $input) {
           __typename
           ... on LoginResultSuccess { accessToken refreshToken }
           ... on LoginResultTfaRequired { tfaType tfaWaitToken }
         }
       }`,
      {input: {email: req.body.email, password: req.body.password}}
    );

    const result = data.loginEmail;
    if (result.__typename === "LoginResultTfaRequired") {
      return res.status(200).send({tfa: true, tfaType: result.tfaType, tfaWaitToken: result.tfaWaitToken});
    }

    const cookies = new Cookies(req, res, {secure: true});
    writeTokens(cookies, {accessToken: result.accessToken, refreshToken: result.refreshToken});
    return res.status(200).send({ok: true});
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
