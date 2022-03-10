import {ShareIcon} from "@heroicons/react/solid";
import classes from "../styles/ShareButton.module.css";
import copy from "copy-to-clipboard";
import {useRef} from "react";
import classNames from "classnames";
import {showButtonToast} from "../lib/ui";

export default function ShareButton({ link, className = "" }) {
  const shareRef = useRef();
  return <div className={classNames(classes.buttonWrap, className)}>
    <ShareIcon
      ref={shareRef}
      className={classes.button}
      onClick={() => {
        copy("https://campfire.moe" + link);
        showButtonToast(shareRef.current, "Скопировано", null, 1500, 7);
      }}
      tabIndex={0}
    />
  </div>;
}
