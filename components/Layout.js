import Header from "./Header";
import classNames from "classnames";
import classes from "../styles/Layout.module.css";
import React from "react";
import {useTheme} from "../lib/theme";

export function getThemeClass() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const theme = useTheme().theme;
  return (theme === "dark" ? classes.dark + " " : "") + classes.light;
}

function Layout({children}, ref) {
  return <div className={classNames(getThemeClass(), classes.layout)} ref={ref}>
    <Header />
    <div className={classes.main}>{children}</div>
  </div>;
}

export default React.memo(React.forwardRef(Layout));
