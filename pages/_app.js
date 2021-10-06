import "normalize.css/normalize.css";
import "../styles/globals.css";
import Layout from "../components/Layout";

export const fetcher = (...args) => fetch(...args).then(res => res.json());

function MyApp({ Component, pageProps }) {
  return <Layout dark>
    <Component {...pageProps} />
  </Layout>;
}

export default MyApp;
