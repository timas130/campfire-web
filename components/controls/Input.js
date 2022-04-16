import classes from "../../styles/Input.module.css";
import classNames from "classnames";
import React from "react";

function Input({className, el, ...props}, ref) {
  const El = el || "input";
  return <El
    {...props} ref={ref}
    className={classNames(classes.input, className)}
  />;
}

export default React.forwardRef(Input);
