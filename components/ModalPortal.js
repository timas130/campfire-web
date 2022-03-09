import React from "react";
import {createPortal} from "react-dom";

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
