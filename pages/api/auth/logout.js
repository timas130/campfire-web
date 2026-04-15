import {graphql, readTokens, clearTokens} from "../../../lib/server";

export default async function logoutHandler(req, res) {
  if (req.method !== "POST") return res.status(405).send({error: true});

  const {cookies, accessToken} = readTokens(req, res);
  // best-effort: tell the server we're logging out; ignore errors
  if (accessToken) {
    try {
      await graphql(`mutation { logout }`, {}, accessToken);
    } catch (e) {
      console.warn("logout graphql failed", e?.messageError);
    }
  }
  clearTokens(cookies);
  res.status(200).send({ok: true});
}
