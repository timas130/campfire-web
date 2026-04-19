import {usePagination, useSearchBox, useStats} from "react-instantsearch";
import {useState} from "react";
import classes from "../styles/Search.module.css";
import Input from "../components/controls/Input";
import Button from "../components/controls/Button";

function CustomSearchBox({defaultRefinement}) {
  const {refine} = useSearchBox();
  const [value, setValue] = useState(defaultRefinement || "");
  return <form className={classes.bar} onSubmit={ev => {
    ev.preventDefault();
    refine(value);
  }}>
    <Input
      type="search" value={value}
      onChange={ev => setValue(ev.target.value)}
      placeholder="Поиск..." className={classes.input}
    />
    <Button type="submit">Поиск</Button>
  </form>;
}

function CustomStats() {
  const {nbHits, processingTimeMS} = useStats();
  return <div className={classes.stats}>Найдено {nbHits} за {processingTimeMS} мс</div>;
}

function CustomPagination() {
  const {currentRefinement, refine, nbPages} = usePagination();
  // usePagination is 0-indexed; keep the UI 1-indexed like the old version
  const page = currentRefinement + 1;
  return <div className={classes.pagination}>
    <Button onClick={() => refine(0)}>«</Button>
    <Button onClick={() => page > 1 && refine(currentRefinement - 1)}>←</Button>
    <span className={classes.paginationText}>{page} из {nbPages}</span>
    <Button onClick={() => page < nbPages && refine(currentRefinement + 1)}>→</Button>
    <Button onClick={() => refine(nbPages - 1)}>»</Button>
  </div>;
}

export {CustomSearchBox, CustomStats, CustomPagination};
