import classes from "../../../styles/Post.module.css";
import classNames from "classnames";
import {BanIcon, ChatIcon, DocumentTextIcon, FilterIcon} from "@heroicons/react/solid";
import {useState} from "react";
import FandomHeader from "../../FandomHeader";
import Switch from "../../controls/Switch";

export const defaultFandomPostFilters = {
  unitTypes: [9],
  allowedTypes: [9, 11],
};
export const defaultProfilePostFilters = {
  unitTypes: [9, 1],
  allowedTypes: [9, 1, 11],
};

function PostFilter({options, setValue, name, type, icon}) {
  return options.allowedTypes.includes(type) && <FandomHeader
    el="div"
    dense
    smallIcon
    addLeft={icon}
    name={name}
    allowOverflow={1}
    author=""
    onClick={() => setValue(type, !options.unitTypes.includes(type))}
    addRight={<Switch
      value={options.unitTypes.includes(type)}
      setValue={value => setValue(type, value)}
    />}
  />;
}

export default function PostFilters({options, setOptions}) {
  const [expanded, setExpanded] = useState(false);

  const setValue = (type, value) => {
    if (value) setOptions(a => ({...a, unitTypes: [...a.unitTypes, type]}));
    else       setOptions(a => ({...a, unitTypes: a.unitTypes.filter(x => x !== type)}));
  };

  return <div className={classNames(classes.post, expanded && classes.filtersExpanded)}>
    <div className={classes.filtersHeader}>
      <div className={classes.filtersButton} tabIndex={0} onClick={() => setExpanded(a => !a)}>
        <FilterIcon /> {expanded ? "Скрыть" : "Показать"} фильтры
      </div>
    </div>
    <div className={classes.filtersContent}>
      <PostFilter setValue={setValue} options={options} name="Посты" type={9} icon={<DocumentTextIcon />} />
      <PostFilter setValue={setValue} options={options} name="Комментарии" type={1} icon={<ChatIcon />} />
      <PostFilter setValue={setValue} options={options} name="Модераторские действия" type={11} icon={<BanIcon />} />
    </div>
  </div>;
}
