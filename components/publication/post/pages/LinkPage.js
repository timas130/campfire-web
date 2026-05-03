import classes from "../../../../styles/Page.module.css";
import {ArrowTopRightOnSquareIcon} from "@heroicons/react/24/outline";
import {matchInternalLink} from "../../../FormattedText";
import classNames from "classnames";
import InputLabel from "../../../controls/InputLabel";
import Input from "../../../controls/Input";
import {EditToolbar, ToolbarActions} from "./Page";
import {useState} from "react";

export default function LinkPage({ page, onEdit = null }) {
  const name = page.name;
  let link = page.link;
  const handle = matchInternalLink(link);
  if (handle) link = "/r/" + encodeURIComponent(handle);

  const El = onEdit ? "div" : "a";

  return <El href={link} target="_blank" rel="noreferrer" className={classNames(
    classes.linkPage,
    onEdit && classes.editable,
  )} onClick={onEdit}>
    <div className={classes.linkIcon}><ArrowTopRightOnSquareIcon /></div>
    <div className={classes.linkText}>
      <div className={classes.linkName}>{name}</div>
      <div className={classes.linkLink}>{handle ? process.env.siteUrl : ""}{link}</div>
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
        placeholder="Исходный код Bonfire Web"
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
