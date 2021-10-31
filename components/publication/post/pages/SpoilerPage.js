import classes from "../../../../styles/Page.module.css";
import {useState} from "react";
import {ChevronDownIcon, ChevronUpIcon} from "@heroicons/react/solid";
import classNames from "classnames";

export default function SpoilerPage({ page, children }) {
  const [expanded, setExpanded] = useState(false);
  return <section>
    <header className={classes.spoilerHeader} onClick={() => setExpanded(x => !x)}>
      {expanded ?
        <ChevronUpIcon className={classes.spoilerIcon} /> :
        <ChevronDownIcon className={classes.spoilerIcon} />}
      {page.name} ({page.length} стр.)
    </header>
    <div className={classNames(classes.spoilerContent, expanded && classes.expanded)}>
      {children}
    </div>
  </section>;
}
