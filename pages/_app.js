import "normalize.css/normalize.css";
import "../styles/globals.css";
import Layout from "../components/Layout";
import {ThemeContext} from "../lib/theme";
import {useState} from "react";
import Router from "next/router";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import {SWRConfig} from "swr";
import {fetcher} from "../lib/client-api";

Router.events.on("routeChangeStart", (url) => {
  console.log("loading", url);
  NProgress.start();
});
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

function MyApp({ Component, pageProps, err }) {
  const [theme, setTheme] = useState("dark");
  return <ThemeContext.Provider value={{theme, setTheme}}>
    <SWRConfig value={{fetcher, revalidateOnFocus: false}}>
      <Layout>
        <Component {...pageProps} err={err} />
      </Layout>
    </SWRConfig>
  </ThemeContext.Provider>;
}

export default MyApp;
