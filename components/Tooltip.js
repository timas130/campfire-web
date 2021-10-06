import classes from "../styles/Tooltip.module.css";

export default function Tooltip({ children, text }) {
  return <figure className={classes.tooltip} tabIndex={0}>
    {children}
    <figcaption className={classes.tooltipText}>{text}</figcaption>
  </figure>;
}
