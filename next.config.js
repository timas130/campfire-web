const { withSentryConfig } = require("@sentry/nextjs");

// no trailing slash!
const cdnUrl = process.env.NODE_ENV === "production" ? "https://cdn.campfire.moe" : "http://localhost:3000";

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
    meiliUrl: "https://campfire.moe/_/meili/",
    // YES! It is safe to publish the public MeiliSearch key.
    // It can only be used for searching and viewing documents.
    meiliKey: "dOJM5oza115d8a93351d5527d7a307ba4c4de10264eb5d0df2d1ba531b2c5e3f421b13b0",
    cdnUrl,
  },
  swcMinify: true,
  assetPrefix: cdnUrl,
  poweredByHeader: false,
}, {
  silent: true,
});
