import classes from "../../../../styles/Page.module.css";
import {ExternalLinkIcon} from "@heroicons/react/outline";
import {sayzenLink} from "../../../FormattedText";
import classNames from "classnames";
import InputLabel from "../../../controls/InputLabel";
import Input from "../../../controls/Input";
import {EditToolbar, ToolbarActions} from "./Page";
import {useState} from "react";

export default function LinkPage({ page, onEdit = null }) {
  const name = page.name;
  let link = page.link;
  const sayzenMatch = link.match(sayzenLink);
  if (sayzenMatch) link = "/r/" + encodeURIComponent(sayzenMatch[1]);

  const El = onEdit ? "div" : "a";

  return <El href={link} target="_blank" rel="noreferrer" className={classNames(
    classes.linkPage,
    onEdit && classes.editable,
  )} onClick={onEdit}>
    <div className={classes.linkIcon}><ExternalLinkIcon /></div>
    <div className={classes.linkText}>
      <div className={classes.linkName}>{name}</div>
      <div className={classes.linkLink}>{sayzenMatch ? "https://campfire.moe" : ""}{link}</div>
    </div>
  </El>;
}

export function LinkPageEdit({ page: initialPage, commit }) {
  const [page, setPage] = useState(initialPage || {
    J_PAGE_TYPE: 4,
    name: "",
    link: "",
  });

  return <div className={classNames(classes.textPage, classes.editing)}>
    <InputLabel>
      Название ссылки
      <Input
        value={page.name}
        onChange={ev => setPage(page => ({
          ...page,
          name: ev.target.value,
        }))}
        placeholder="Исходный код Campfire Web"
      />
    </InputLabel>
    <InputLabel>
      Ссылка
      <Input
        value={page.link}
        onChange={ev => setPage(page => ({
          ...page,
          link: ev.target.value,
        }))}
        placeholder="https://github.com/timas130/campfire-web"
      />
    </InputLabel>

    <EditToolbar>
      <ToolbarActions commit={commit} page={page} />
    </EditToolbar>
  </div>;
}
