// This file configures the initialization of Sentry on the browser.
// The config you add here will be used whenever a page is visited.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

// I disabled Sentry on the client because it takes most
// of the bundle. Unless I find a perfect alternative
// or the devs fix their stupid lib, this will remain commented.

// import * as Sentry from "@sentry/nextjs";
//
// const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;
//
// if (process.env.NODE_ENV !== "development") Sentry.init({
//   dsn: SENTRY_DSN || "https://b889e482f6b741c8820007e187126286@data.33rd.dev/8",
//   tracesSampleRate: 0.5,
//   tunnel: "/api/data",
// });
