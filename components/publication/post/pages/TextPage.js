import {icons} from "./icons";
import classNames from "classnames";
import classes from "../../../../styles/Page.module.css";
import React, {useState} from "react";
import FormattedText from "../../../FormattedText";
import Input from "../../../controls/Input";
import {faAlignCenter} from "@fortawesome/free-solid-svg-icons/faAlignCenter";
import {faAlignLeft} from "@fortawesome/free-solid-svg-icons/faAlignLeft";
import {faAlignRight} from "@fortawesome/free-solid-svg-icons/faAlignRight";
import {faHeading} from "@fortawesome/free-solid-svg-icons/faHeading";
import {faIcons} from "@fortawesome/free-solid-svg-icons/faIcons";
import {EditToolbar, ToolbarActions, ToolbarButton} from "./Page";
import {showButtonToast} from "../../../../lib/ui";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

export default function TextPage({ page, onEdit = null }) {
  const big = Boolean(page["J_SIZE"]);
  const textAlign =
    page.align === 1 ? "right" :
    page.align === 2 ? "center" :
    "left";
  const icon = icons[page["icon"]];
  const text = page["J_TEXT"];
  return <div className={classNames(
    classes.textPage,
    big && classes.textBig,
    onEdit && classes.editable,
  )} onClick={onEdit}>
    {icon && <FontAwesomeIcon icon={icon} className={classes.textIcon} />}
    <p className={classes.textBlock} style={{textAlign}}>
      <FormattedText text={text} />
    </p>
  </div>;
}

export function TextPageEdit({ page: initialPage, commit }) {
  const [page, setPage] = useState(initialPage || {
    J_PAGE_TYPE: 1,
    J_TEXT: "",
    J_SIZE: 0,
    align: 0,
    icon: 0,
  });

  const textAlign =
    page.align === 1 ? "right" :
    page.align === 2 ? "center" :
    "left";

  return <section className={classNames(
    classes.textPage, classes.editing
  )}>
    <Input
      el="textarea"
      value={page.J_TEXT}
      className={classNames(
        Boolean(page.J_SIZE) && classes.textBig,
      )}
      style={{textAlign}}
      onChange={ev => setPage(page => ({
        ...page,
        J_TEXT: ev.target.value,
      }))}
      autoFocus
    />
    <EditToolbar>
      <ToolbarButton
        icon={faHeading} active={page.J_SIZE === 1}
        onClick={() => setPage(page => ({
          ...page,
          J_SIZE: page.J_SIZE === 1 ? 0 : 1,
        }))}
      />
      <ToolbarButton
        icon={faIcons} active={page.icon !== 0} sep
        onClick={ev => showButtonToast(ev.target, "Скоро :)", null, 2000, -60)}
      />

      <ToolbarButton
        icon={faAlignLeft} active={page.align === 0}
        onClick={() => setPage(page => ({
          ...page,
          align: 0,
        }))}
      />
      <ToolbarButton
        icon={faAlignCenter} active={page.align === 2}
        onClick={() => setPage(page => ({
          ...page,
          align: 2,
        }))}
      />
      <ToolbarButton
        icon={faAlignRight} active={page.align === 1}
        onClick={() => setPage(page => ({
          ...page,
          align: 1,
        }))}
      />

      <ToolbarActions commit={commit} page={page} />
    </EditToolbar>
  </section>;
}
