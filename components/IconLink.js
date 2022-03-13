import classes from "../styles/IconLink.module.css";
import Link from "next/link";
import classNames from "classnames";

export default function IconLink({children, className, href, onClick, left, right, primary, top, bottom = true}) {
  const el = <a className={classNames(
    classes.iconLink,
    left && classes.left,
    right && classes.right,
    primary && classes.primary,
    top && classes.top,
    bottom && classes.bottom,
    className,
  )} onClick={onClick}>
    {children}
  </a>;
  return onClick ? el : <Link href={href}>{el}</Link>;
}
