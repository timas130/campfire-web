import NextErrorComponent from "next/error";

import * as Sentry from "@sentry/nextjs";

const MyError = ({statusCode}) => {
  return <NextErrorComponent statusCode={statusCode} />;
};

MyError.getInitialProps = async ({ res, err, asPath }) => {
  const errorInitialProps = await NextErrorComponent.getInitialProps({res, err});

  errorInitialProps.hasGetInitialPropsRun = true;

  if (err) {
    Sentry.captureException(err);

    await Sentry.flush(2000);

    return errorInitialProps;
  }

  const error = new Error(`_error.js getInitialProps missing data at path: ${asPath}`);
  console.warn(error);
  Sentry.captureException(error);
  await Sentry.flush(2000);

  return errorInitialProps;
};

export default MyError;