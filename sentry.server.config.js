import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn: SENTRY_DSN || 'https://9bee8f0fa93c43db900e6eaf1bd504d7@o911018.ingest.sentry.io/6005751',
  tracesSampleRate: 1.0,
});
