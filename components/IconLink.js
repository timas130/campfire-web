import classes from "../styles/IconLink.module.css";
import Link from "next/link";
import classNames from "classnames";

export default function IconLink({children, href, left, right, primary}) {
  return <Link href={href}><a className={classNames(
    classes.iconLink,
    left && classes.left,
    right && classes.right,
    primary && classes.primary,
  )}>
    {children}
  </a></Link>;
}
