import {graphql, writeTokens} from "../../../lib/server";
import Cookies from "cookies";
import {requireArguments, sendErrorIfFromRemote} from "../../../lib/api";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send({error: true});
  if (requireArguments(req, res, ["provider", "code", "state", "nonce"])) return;
  try {
    const data = await graphql(
      `mutation($input: OauthLoginInput!) {
         loginOauth(input: $input) {
           emailAlreadyBound
           tokens { accessToken refreshToken }
         }
       }`,
      {input: {provider: req.body.provider, code: req.body.code, state: req.body.state, nonce: req.body.nonce}}
    );
    const {tokens, emailAlreadyBound} = data.loginOauth;
    if (!tokens) return res.send({ok: false, emailAlreadyBound});
    const cookies = new Cookies(req, res, {secure: true});
    writeTokens(cookies, tokens);
    res.send({ok: true});
  } catch (e) { sendErrorIfFromRemote(res, e); }
}
