import Header from "./Header";
import classNames from "classnames";
import classes from "../styles/Layout.module.css";
import React from "react";

function Layout({children, dark}, ref) {
  return <div className={classNames(dark && classes.dark, classes.light, classes.layout)} ref={ref}>
    <Header />
    <div className={classes.main}>{children}</div>
  </div>;
}

export default React.forwardRef(Layout);
