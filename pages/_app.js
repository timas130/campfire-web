import "normalize.css/normalize.css";
import "../styles/globals.css";
import Layout from "../components/Layout";

function MyApp({ Component, pageProps }) {
  return <Layout dark>
    <Component {...pageProps} />
  </Layout>;
}

export default MyApp;
