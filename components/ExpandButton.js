import classes from "../styles/Post.module.css";
import {ChevronDownIcon, ChevronUpIcon} from "@heroicons/react/solid";
import {useCallback, useEffect, useRef, useState} from "react";

/**
 * When using make sure that `expanded` is `true` by default!
 */
export default function ExpandButton({expanded, setExpanded, contentRef, maxHeight = 512}) {
  const [expandable, setExpandable] = useState(false);
  const [bodyTop, setBodyTop] = useState(null);
  const [buttonTop, setButtonTop] = useState(null);
  const buttonRef = useRef();

  useEffect(() => {
    if (expandable) return;
    const contentRect = contentRef.current.getBoundingClientRect();
    const expandableNew = contentRect.height > maxHeight;
    setExpandable(expandableNew);
    setExpanded(!expandableNew);
  }, [contentRef, expandable, maxHeight, setExpanded]);
  useEffect(() => {
    if (!bodyTop || !buttonTop) return;
    if (expanded) {
      window.scrollTo({
        top: bodyTop
      });
    } else {
      const currentBodyTop = Math.abs(document.body.getBoundingClientRect().top);
      const currentButtonTop = buttonRef.current.getBoundingClientRect().top;
      console.log(`${currentBodyTop} + (${buttonTop} - ${currentButtonTop}) = ${currentBodyTop + (buttonTop - currentButtonTop)}`);
      window.scrollTo({
        top: currentBodyTop + (currentButtonTop - buttonTop)
      });
    }
    setBodyTop(null);
    setButtonTop(null);
  }, [expanded, bodyTop, buttonTop]);

  const toggleExpand = useCallback(() => {
    setBodyTop(Math.abs(document.body.getBoundingClientRect().top));
    setButtonTop(buttonRef.current.getBoundingClientRect().top);
    setExpanded(x => !x);
  }, [setExpanded]);

  return expandable ? <div className={classes.expander} onClick={toggleExpand} ref={buttonRef}>
    {expanded ?
      <ChevronUpIcon className={classes.expandIcon} /> :
      <ChevronDownIcon className={classes.expandIcon} />}
    {expanded ? "Свернуть" : "Развернуть"}
  </div> : null;
}
