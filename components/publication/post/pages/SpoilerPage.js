import classes from "../../../../styles/Page.module.css";
import {useState} from "react";
import {ChevronDownIcon, ChevronUpIcon} from "@heroicons/react/solid";
import classNames from "classnames";
import InputLabel from "../../../controls/InputLabel";
import Input from "../../../controls/Input";
import {EditToolbar, ToolbarActions} from "./Page";
import FormattedText from "../../../FormattedText";
import {showErrorToast} from "../../../../lib/ui";

export default function SpoilerPage({ page, children, onEdit = null }) {
  const [expanded, setExpanded] = useState(Boolean(onEdit));

  return <div>
    <header tabIndex={0} className={classNames(
      classes.spoilerHeader,
      page.__internal && classes.internal,
      onEdit && classes.editable,
    )} onClick={onEdit ?? (() => setExpanded(x => !x))}>
      {expanded ?
        <ChevronUpIcon className={classes.spoilerIcon} /> :
        <ChevronDownIcon className={classes.spoilerIcon} />}
      <FormattedText text={page.name} /> {!page.__internal && `(${page.length || page.count} стр.)`}
    </header>
    <div className={classNames(classes.spoilerContent, expanded && classes.expanded)}>
      {children}
    </div>
  </div>;
}

export function SpoilerPageEdit({page: initialPage, commit}) {
  const [page, setPage] = useState(initialPage || {
    J_PAGE_TYPE: 6,
    name: "",
    count: 0,
  });

  const commitProxy = (page, target) => {
    if (page?.count > 10 || page?.count < 1) {
      showErrorToast(target, "Количество страниц не может быть больше 10");
      return;
    }
    commit(page, target);
  };

  return <div className={classNames(classes.spoilerHeader, classes.editing)}>
    <InputLabel>
      Заголовок спойлера
      <Input
        value={page.name}
        placeholder="Смешные котята"
        onChange={ev => setPage(page => ({
          ...page,
          name: ev.target.value,
        }))}
      />
    </InputLabel>
    <InputLabel>
      Количество скрытых страниц
      <Input
        value={page.count || page.length}
        type="number"
        min={1}
        max={10}
        onChange={ev => setPage(page => ({
          ...page,
          length: parseInt(ev.target.value) || 0,
          count: parseInt(ev.target.value) || 0,
        }))}
      />
    </InputLabel>

    <EditToolbar>
      <ToolbarActions page={page} commit={commitProxy} />
    </EditToolbar>
  </div>;
}
