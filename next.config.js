module.exports = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/opensearch.xml",
        headers: [
          {
            key: "Content-Type",
            value: "application/opensearchdescription+xml",
          },
        ],
      },
    ];
  },
  env: {
    meiliUrl: "https://camp.33rd.dev/_/meili/",
    // YES! It is safe to publish the public MeiliSearch key.
    // It can only be used for searching and viewing documents.
    meiliKey: "7d88dd2e3ba29c616fa717ae558813f6cbf5f1614ca6611ec1efdfdbcdcc5264",
  },
};
