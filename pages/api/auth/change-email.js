import {graphql, readTokens} from "../../../lib/server";
import {requireArguments, sendErrorIfFromRemote} from "../../../lib/api";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send({error: true});
  if (requireArguments(req, res, ["newEmail"])) return;
  const {accessToken} = readTokens(req, res);
  try {
    await graphql(
      `mutation($e: String!) { changeEmail(newEmail: $e) }`,
      {e: req.body.newEmail},
      accessToken
    );
    res.send({ok: true});
  } catch (e) { sendErrorIfFromRemote(res, e); }
}
