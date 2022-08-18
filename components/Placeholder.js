import classes from "../styles/Placeholder.module.css";
import classNames from "classnames";

export function TextPlaceholder(props) {
  const {className, children, el, w, h, ww, style, mb, mr, ...rest} = props;
  const El = el || "span";
  return <El className={classNames(classes.text, className)} style={{
    maxWidth: w,
    width: ww,
    height: h,
    marginBottom: mb,
    marginRight: mr,
    ...style,
  }} {...rest} />;
}

export function BoxPlaceholder(props) {
  const {className, children, el, w, h, style, mb, mr, ...rest} = props;
  const El = el || "div";
  return <El className={classNames(classes.box, className)} style={{
    width: w,
    height: h,
    marginBottom: mb,
    marginRight: mr,
    ...style,
  }} {...rest} />;
}
