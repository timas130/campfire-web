import classes from "../styles/Placeholder.module.css";
import classNames from "classnames";

export function TextPlaceholder(props) {
  const {className, children, el, ...rest} = props;
  const El = el || "span";
  return <El className={classNames(classes.text, className)} {...rest} />;
}

export function BoxPlaceholder(props) {
  const {className, children, el, w, h, style, ...rest} = props;
  const El = el || "div";
  return <El className={classNames(classes.box, className)} style={{
    width: w,
    height: h,
    ...style,
  }} {...rest} />;
}
