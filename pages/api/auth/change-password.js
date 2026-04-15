import {graphql, readTokens} from "../../../lib/server";
import {requireArguments, sendErrorIfFromRemote} from "../../../lib/api";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send({error: true});
  if (requireArguments(req, res, ["oldPassword", "newPassword"])) return;
  const {accessToken} = readTokens(req, res);
  try {
    await graphql(
      `mutation($o: String!, $n: String!) { changePassword(oldPassword: $o, newPassword: $n) }`,
      {o: req.body.oldPassword, n: req.body.newPassword},
      accessToken
    );
    res.send({ok: true});
  } catch (e) { sendErrorIfFromRemote(res, e); }
}
