const graphqlUrl = "https://api.bonfire.moe/";

/**
 * POST a GraphQL query/mutation to rust-melior.
 * @param {string} query the GraphQL document
 * @param {{[p: string]: *}} [variables={}]
 * @param {string | null} [accessToken=null] bearer token, or null for public ops
 * @returns {Promise<any>} the `data` field of the response
 */
async function graphql(query, variables = {}, accessToken = null) {
  const headers = {"Content-Type": "application/json"};
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let resp;
  try {
    resp = await fetch(graphqlUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({query, variables}),
    });
  } catch (e) {
    throw {code: "ERROR_NETWORK", messageError: e.message || "Network failure", params: [], cweb: true};
  }

  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw {
      code: "ERROR_RPC_HTTP_" + resp.status,
      messageError: text.slice(0, 200) || `HTTP ${resp.status}`,
      params: [],
      cweb: true,
    };
  }

  const json = await resp.json();
  if (json.errors && json.errors.length > 0) {
    const first = json.errors[0];
    console.warn(`[graphql] ${first.message}`);
    throw {
      code: first.extensions?.code || "GRAPHQL_ERROR",
      messageError: first.message,
      params: [],
      cweb: true,
    };
  }
  return json.data;
}

module.exports = {graphql};
