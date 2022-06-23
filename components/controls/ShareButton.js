import {ShareIcon} from "@heroicons/react/solid";
import classes from "../../styles/ShareButton.module.css";
import copy from "copy-to-clipboard";
import {useRef} from "react";
import classNames from "classnames";
import {showButtonToast} from "../../lib/ui";

export default function ShareButton({ link, noMr, className = "" }) {
  const shareRef = useRef();
  return <div
    className={classNames(classes.buttonWrap, noMr && classes.noMr, className)}
    onClick={() => {
      copy("https://campfire.moe" + link);
      showButtonToast(shareRef.current, "Скопировано", null, 1500, 7);
    }}
  >
    <ShareIcon
      ref={shareRef}
      className={classes.button}
      tabIndex={0}
    />
  </div>;
}
