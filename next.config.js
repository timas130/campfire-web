const { withSentryConfig } = require('@sentry/nextjs');

module.exports = withSentryConfig({
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
    meiliKey: "dOJM5oza115d8a93351d5527d7a307ba4c4de10264eb5d0df2d1ba531b2c5e3f421b13b0",
  },
  swcMinify: true,
}, {
  silent: true,
});
