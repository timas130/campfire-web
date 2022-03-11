import {connectPagination, connectSearchBox, connectStats} from "react-instantsearch-dom";
import {useState} from "react";
import classes from "../styles/Search.module.css";
import Input from "../components/controls/Input";
import Button from "../components/controls/Button";

const CustomSearchBox = connectSearchBox(({ refine }) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [value, setValue] = useState("");
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
});
const CustomStats = connectStats(({ nbHits, processingTimeMS }) => {
  return <div className={classes.stats}>Найдено {nbHits} за {processingTimeMS} мс</div>;
});
const CustomPagination = connectPagination(({ currentRefinement, refine, nbPages }) => {
  return <div className={classes.pagination}>
    <Button onClick={() => refine(1)}>«</Button>
    <Button onClick={() => currentRefinement > 1 && refine(currentRefinement - 1)}>←</Button>
    <span className={classes.paginationText}>{currentRefinement} из {nbPages}</span>
    <Button onClick={() => currentRefinement < nbPages && refine(currentRefinement + 1)}>→</Button>
    <Button onClick={() => refine(nbPages)}>»</Button>
  </div>;
});

export {CustomSearchBox, CustomStats, CustomPagination};
