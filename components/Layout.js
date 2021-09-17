import Header from "./Header";
import classNames from "classnames";
import classes from "../styles/Layout.module.css";

export default function Layout({children, dark}) {
  return <div className={classNames(dark && classes.dark, classes.layout)}>
    <Header />
    <main className={classes.main}>{children}</main>
  </div>;
};
