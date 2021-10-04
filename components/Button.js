import classes from "../styles/Button.module.css";
import classNames from "classnames";
import React from "react";

function Button(props, ref) {
  const {children, className, el, noBackground, fullWidth, ...rest} = props;
  const El = el || "button";
  return <El className={classNames(
    classes.button,
    noBackground && classes.noBackground,
    fullWidth && classes.fullWidth,
    className
  )} ref={ref} {...rest}>
    {children}
  </El>;
}

export default React.forwardRef(Button);
