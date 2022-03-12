import classes from "../styles/Feed.module.css";
import classNames from "classnames";
import React from "react";
import Spinner from "./Spinner";

export const FeedLoader = React.forwardRef(
  function FeedLoader(props, ref) {
    return <div className={classes.loader} ref={ref}>
      {!props.text && <Spinner />}
      {props.text || "Загрузка..."}
    </div>;
  }
);

function FeedLayout(props, listRef) {
  const {staticSidebar, list, sidebar} = props;
  return <div className={classNames(classes.feed, "container")}>
    <main className={classes.feedList} ref={listRef}>
      <div className={classes.feedStatic}>{staticSidebar}</div>
      {list}
    </main>
    <aside className={classes.feedSidebar}>
      {staticSidebar}
      {sidebar}
    </aside>
  </div>;
}

export default React.forwardRef(FeedLayout);
