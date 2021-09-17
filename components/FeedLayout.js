import classes from "../styles/Feed.module.css";

function FeedLayout(props) {
  const {list, sidebar} = props;
  return <div className={classes.feed}>
    <main className={classes.feedList}>{list}</main>
    <aside className={classes.feedSidebar}>{sidebar}</aside>
  </div>;
}

export default FeedLayout;
