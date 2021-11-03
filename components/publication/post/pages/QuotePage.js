import classes from "../../../../styles/Page.module.css";
import classNames from "classnames";
import {useState} from "react";
import Input from "../../../Input";
import InputLabel from "../../../InputLabel";
import {EditToolbar, ToolbarActions} from "./Page";

export default function QuotePage({ page, onEdit = null }) {
  const author = page.author;
  const text = page.text;
  return <div className={classNames(classes.linkPage, onEdit && classes.editable)} onClick={onEdit}>
    <figure className={classNames(classes.linkText, classes.quoteText)}>
      {author && <figcaption className={classes.linkName}>
        {author + ":"}
      </figcaption>}
      <blockquote>
        {text}
      </blockquote>
    </figure>
  </div>;
}

export function QuotePageEdit({ page: initialPage, commit }) {
  const [page, setPage] = useState(initialPage || {
    J_PAGE_TYPE: 5,
    author: "",
    text: "",
  });

  return <div className={classNames(classes.textPage, classes.editing)}>
    <InputLabel>
      Автор
      <Input
        value={page.author}
        onChange={ev => setPage(page => ({
          ...page,
          author: ev.target.value,
        }))}
        placeholder="А. С. Пушкин"
      />
    </InputLabel>
    <InputLabel>
      Текст цитаты
      <Input
        el="textarea"
        value={page.text}
        onChange={ev => setPage(page => ({
          ...page,
          text: ev.target.value,
        }))}
        placeholder="Сижу за решеткой в темнице сырой..."
      />
    </InputLabel>

    <EditToolbar>
      <ToolbarActions commit={commit} page={page} />
    </EditToolbar>
  </div>;
}
