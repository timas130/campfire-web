import classes from "../styles/Button.module.css";
import classNames from "classnames";
import React from "react";

function Button(props, ref) {
  const {children, className, el, noBackground, ...rest} = props;
  return React.createElement(el || "button", {
    className: classNames(
      classes.button,
      noBackground && classes.noBackground,
      className
    ),
    ref,
    ...rest
  }, children);
}

export default React.forwardRef(Button);
