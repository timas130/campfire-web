import "normalize.css/normalize.css";
import "../styles/globals.css";

export const fetcher = (...args) => fetch(...args).then(res => res.json());

function MyApp({ Component, pageProps }) {
  return <Component {...pageProps} />;
}

export default MyApp;
