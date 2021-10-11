import classes from "../../../../styles/Page.module.css";
import {ExternalLinkIcon} from "@heroicons/react/outline";

export default function LinkPage({ page }) {
  const name = page.name;
  const link = page.link;
  return <a href={link} target="_blank" rel="noreferrer" className={classes.linkPage}>
    <div className={classes.linkIcon}><ExternalLinkIcon /></div>
    <div className={classes.linkText}>
      <div className={classes.linkName}>{name}</div>
      <div className={classes.linkLink}>{link}</div>
    </div>
  </a>;
}
