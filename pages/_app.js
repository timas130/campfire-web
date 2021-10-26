import "normalize.css/normalize.css";
import "../styles/globals.css";
import Layout from "../components/Layout";
import {ThemeContext} from "../lib/theme";
import {useState} from "react";

function MyApp({ Component, pageProps }) {
  const [theme, setTheme] = useState("dark");
  return <ThemeContext.Provider value={{theme, setTheme}}>
    <Layout dark={theme === "dark"}>
      <Component {...pageProps} />
    </Layout>
  </ThemeContext.Provider>;
}

export default MyApp;
