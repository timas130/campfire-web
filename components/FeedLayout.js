import classes from "../styles/Feed.module.css";
import classNames from "classnames";
import React from "react";

export const FeedLoader = React.forwardRef(
  function FeedLoader(props, ref) {
    return <div className={classes.loader} ref={ref}>
      {props.text || "Загрузка..."}
    </div>;
  }
);

function FeedLayout(props) {
  const {list, sidebar} = props;
  return <div className={classNames(classes.feed, "container")}>
    <main className={classes.feedList}>{list}</main>
    <aside className={classes.feedSidebar}>{sidebar}</aside>
  </div>;
}

export default FeedLayout;
