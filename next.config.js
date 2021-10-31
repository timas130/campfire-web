module.exports = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/opensearch.xml",
        headers: [
          {
            key: "Content-Type",
            value: "application/opensearchdescription+xml"
          },
        ],
      },
    ];
  }
};
