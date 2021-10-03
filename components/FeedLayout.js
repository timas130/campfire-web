import classes from "../styles/Feed.module.css";
import classNames from "classnames";
import {RefreshIcon} from "@heroicons/react/solid";

export function FeedLoader() {
  return <div className={classes.loader}>
    <RefreshIcon />
    Загрузка...
  </div>;
}

function FeedLayout(props) {
  const {list, sidebar} = props;
  return <div className={classNames(classes.feed, "container")}>
    <main className={classes.feedList}>{list}</main>
    <aside className={classes.feedSidebar}>{sidebar}</aside>
  </div>;
}

export default FeedLayout;
