import {graphql} from "../../../lib/server";
import {sendErrorIfFromRemote} from "../../../lib/api";

export default async function handler(req, res) {
  const provider = (req.query.provider || "GOOGLE").toUpperCase();
  try {
    const data = await graphql(
      `query($p: OauthProvider!) { oauthUrl(provider: $p) { scope state nonce } }`,
      {p: provider}
    );
    res.send(data.oauthUrl);
  } catch (e) { sendErrorIfFromRemote(res, e); }
}
