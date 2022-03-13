import classes from "../styles/Tooltip.module.css";
import classNames from "classnames";
import {useEffect, useRef, useState} from "react";

export default function Tooltip({ children, text, className = "" }) {
  const parentRef = useRef();
  const tooltipRef = useRef();
  const [tooltipStyle, setTooltipStyle] = useState({
    visibility: "hidden",
    position: "fixed",
  });

  useEffect(() => {
    if (!parentRef.current) return;
    const parentEl = parentRef.current;
    const tooltipEl = tooltipRef.current;

    const enterListener = () => {
      const bodyBB = document.body.getBoundingClientRect();
      const bodyOffset = Math.abs(bodyBB.top);
      const parentBB = parentEl.getBoundingClientRect();
      const tooltipBB = tooltipEl.getBoundingClientRect();
      if (tooltipBB.width >= bodyBB.width) {
        setTooltipStyle({
          visibility: "visible",
          position: "absolute",
          top: bodyOffset + parentBB.top - tooltipBB.height,
          left: 0,
          width: "100%",
        });
      } else {
        setTooltipStyle({
          visibility: "visible",
          position: "absolute",
          top: bodyOffset + parentBB.top - tooltipBB.height,
          left: Math.max(parentBB.left - tooltipBB.width / 2 + parentBB.width / 2, 0),
        });
      }
    };
    const leaveListener = () => {
      setTooltipStyle({
        visibility: "hidden",
        position: "fixed",
      });
    };

    parentEl.addEventListener("mouseenter", enterListener);
    parentEl.addEventListener("focus", enterListener);
    parentEl.addEventListener("mouseleave", leaveListener);
    parentEl.addEventListener("blur", leaveListener);
    return () => {
      parentEl.removeEventListener("mouseenter", enterListener);
      parentEl.removeEventListener("focus", enterListener);
      parentEl.removeEventListener("mouseleave", leaveListener);
      parentEl.removeEventListener("blur", leaveListener);
    };
  }, []);

  return <div className={classNames(classes.tooltip, className)} tabIndex={0} ref={parentRef}>
    <span className={classes.tooltipText} style={tooltipStyle} ref={tooltipRef}>{text}</span>
    {children}
  </div>;
}
