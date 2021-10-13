const {withSentryConfig} = require("@sentry/nextjs");
const config = {
  reactStrictMode: true,
};

const SentryWebpackPluginOptions = {
  silent: true,
};

module.exports = withSentryConfig(config, SentryWebpackPluginOptions);
