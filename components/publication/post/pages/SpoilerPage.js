import classes from "../../../../styles/Page.module.css";
import {useState} from "react";
import {ChevronDownIcon, ChevronUpIcon} from "@heroicons/react/solid";
import classNames from "classnames";
import InputLabel from "../../../InputLabel";
import Input from "../../../Input";
import {EditToolbar, ToolbarActions} from "./Page";

export default function SpoilerPage({ page, children, onEdit = null }) {
  const [expanded, setExpanded] = useState(Boolean(onEdit));

  return <section>
    <header tabIndex={0} className={classNames(
      classes.spoilerHeader,
      onEdit && classes.editable
    )} onClick={onEdit ?? (() => setExpanded(x => !x))}>
      {expanded ?
        <ChevronUpIcon className={classes.spoilerIcon} /> :
        <ChevronDownIcon className={classes.spoilerIcon} />}
      {page.name} ({page.length || page.count} стр.)
    </header>
    <div className={classNames(classes.spoilerContent, expanded && classes.expanded)}>
      {children}
    </div>
  </section>;
}

export function SpoilerPageEdit({page: initialPage, commit}) {
  const [page, setPage] = useState(initialPage || {
    J_PAGE_TYPE: 6,
    name: "",
    count: 0,
  });

  return <div className={classNames(classes.spoilerHeader, classes.editing)}>
    <InputLabel>
      Заголовок спойлера
      <Input
        value={page.name} placeholder="Смешные котята"
        onChange={ev => setPage(page => ({
          ...page,
          name: ev.target.value,
        }))}
      />
    </InputLabel>
    <InputLabel>
      Количество скрытых страниц
      <Input
        value={page.count || page.length} type="number"
        onChange={ev => setPage(page => ({
          ...page,
          length: parseInt(ev.target.value) || 0,
          count: parseInt(ev.target.value) || 0,
        }))}
      />
    </InputLabel>

    <EditToolbar>
      <ToolbarActions page={page} commit={commit} />
    </EditToolbar>
  </div>;
}
