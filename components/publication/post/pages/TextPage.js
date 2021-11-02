import {icons} from "./icons";
import classNames from "classnames";
import classes from "../../../../styles/Page.module.css";
import React, {useState} from "react";
import FormattedText from "../../../FormattedText";
import Input from "../../../Input";
import {faAlignCenter, faAlignLeft, faAlignRight, faHeading, faIcons} from "@fortawesome/free-solid-svg-icons";
import {ToolbarButton, ToolbarLeft} from "./Page";

export default function TextPage({ page, onEdit = null }) {
  const big = Boolean(page["J_SIZE"]);
  const textAlign =
    page.align === 1 ? "right" :
    page.align === 2 ? "center" :
    "left";
  const icon = icons[page["icon"]];
  const text = page["J_TEXT"];
  return <section className={classNames(
    classes.textPage,
    big && classes.textBig,
    onEdit && classes.editable,
  )} onClick={onEdit}>
    {icon && React.createElement(icon, {className: classes.textIcon})}
    <p className={classes.textBlock} style={{textAlign}}>
      <FormattedText text={text} />
    </p>
  </section>;
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
    />
    <div className={classes.editToolbar}>
      <ToolbarButton
        icon={faHeading}
        onClick={() => setPage(page => ({
          ...page,
          J_SIZE: page.J_SIZE === 1 ? 0 : 1,
        }))}
      />
      <ToolbarButton
        icon={faIcons} active={page.icon !== 0} sep
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

      <ToolbarLeft commit={commit} page={page} />
    </div>
  </section>;
}
