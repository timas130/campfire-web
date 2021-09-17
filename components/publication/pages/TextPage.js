import {icons} from "./icons";
import classNames from "classnames";
import classes from "../../../styles/Page.module.css";
import React from "react";
import FormattedText from "../../FormattedText";

export default function TextPage({ page }) {
  const big = Boolean(page["J_SIZE"]);
  const textAlign =
    page["align"] === 1 ? "right" :
    page["align"] === 2 ? "center" :
    "left";
  const icon = icons[page["icon"]];
  const text = page["J_TEXT"];
  return <section className={classNames(
    classes.textPage,
    big && classes.textBig
  )}>
    {icon && React.createElement(icon, {className: classes.textIcon})}
    <p className={classes.textBlock} style={{textAlign}}>
      <FormattedText text={text} />
    </p>
  </section>;
}
