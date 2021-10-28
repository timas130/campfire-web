import classes from "../../../../styles/Page.module.css";
import {ExternalLinkIcon} from "@heroicons/react/outline";
import {sayzenLink} from "../../../FormattedText";

export default function LinkPage({ page }) {
  const name = page.name;
  let link = page.link;
  const sayzenMatch = link.match(sayzenLink);
  if (sayzenMatch) link = "/r/" + encodeURIComponent(sayzenMatch[1]);
  return <a href={link} target="_blank" rel="noreferrer" className={classes.linkPage}>
    <div className={classes.linkIcon}><ExternalLinkIcon /></div>
    <div className={classes.linkText}>
      <div className={classes.linkName}>{name}</div>
      <div className={classes.linkLink}>{sayzenMatch ? "https://camp.33rd.dev" : ""}{link}</div>
    </div>
  </a>;
}
