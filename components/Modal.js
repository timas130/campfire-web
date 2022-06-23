import React from "react";
import {createPortal} from "react-dom";
import classes from "../styles/Modal.module.css";
import postClasses from "../styles/Post.module.css";
import classNames from "classnames";
import {XIcon} from "@heroicons/react/solid";
import {getThemeClass} from "./Layout";
import {FocusTrap} from "@headlessui/react";

export class ModalPortal extends React.Component {
  constructor(props) {
    super(props);
    this.el = document.createElement("div");
  }

  componentDidMount() {
    const modalRoot = document.getElementById("modal-root");
    modalRoot.appendChild(this.el);
    document.documentElement.classList.add("modal-open");
  }

  componentWillUnmount() {
    const modalRoot = document.getElementById("modal-root");
    modalRoot.removeChild(this.el);
    if (modalRoot.childElementCount === 0) {
      document.documentElement.classList.remove("modal-open");
    }
  }

  render() {
    return createPortal(
      this.props.children,
      this.el,
    );
  }
}

export function ModalDialog({children, close, title, scrollable}) {
  return <div
    className={classNames("modal", classes.dialogWrap)}
    onClick={() => close()}
    onKeyDown={ev => ev.key === "Escape" && close()}
  >
    <FocusTrap>
      <div className={classNames(classes.dialog, postClasses.post, getThemeClass())}
           onClick={ev => ev.stopPropagation()}>
        <div className={classes.dialogHeader}>
          {title}
          <div className={classes.dialogClose} onClick={() => close()} tabIndex={0}>
            <XIcon /> Закрыть
          </div>
        </div>
        <div className={scrollable && classes.scrollable}>{children}</div>
      </div>
    </FocusTrap>
  </div>;
}
