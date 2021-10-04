import {ShareIcon} from "@heroicons/react/solid";
import classes from "../styles/ShareButton.module.css";
import copy from "copy-to-clipboard";

export default function ShareButton({ link }) {
  // TODO: add feedback when copying
  return <ShareIcon className={classes.button} onClick={() => {
    copy(link);
  }} />;
}
