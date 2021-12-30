import {ShareIcon} from "@heroicons/react/solid";
import classes from "../styles/ShareButton.module.css";
import copy from "copy-to-clipboard";
import {useEffect, useState} from "react";
import classNames from "classnames";

export default function ShareButton({ link, className = "" }) {
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    if (copied) {
      let timeout = setTimeout(() => {
        setCopied(false);
        timeout = null;
      }, 2000);
      return () => timeout && clearTimeout(timeout);
    }
  }, [copied]);
  return <div className={classNames(classes.buttonWrap, className)}>
    <div className={classNames(
      classes.copied,
      copied && classes.active
    )}>
      Скопировано
    </div>
    <ShareIcon
      className={classes.button}
      onClick={() => {
        copy("https://camp.33rd.dev" + link);
        setCopied(true);
      }}
      tabIndex={0}
    />
  </div>;
}
