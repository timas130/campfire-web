import classes from "../styles/Tooltip.module.css";
import classNames from "classnames";

export default function Tooltip({ children, text, className = "" }) {
  return <figure className={classNames(classes.tooltip, className)} tabIndex={0}>
    {children}
    <figcaption className={classes.tooltipText}>{text}</figcaption>
  </figure>;
}
