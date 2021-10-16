import {Client} from "@elastic/elasticsearch";

export async function searchPosts(query) {
  const client = new Client({
    node: process.env.ELASTIC_URL,
    auth: {
      apiKey: process.env.ELASTIC_KEY
    }
  });
  return (await client.search({
    index: "posts-*",
    body: {
      query: {
        simple_query_string: {
          query,
          fields: ["content.content_russian", "content.content_english", "rubric-name", "activity-name", "tags"],
        },
      },
    },
  })).body.hits.hits.map(hit => JSON.parse(hit._source.raw_data));
}

export default async function searchHandler(req, res) {
  res.send(await searchPosts(req.query.q));
}
