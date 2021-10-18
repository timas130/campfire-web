import classes from "../../../../styles/Page.module.css";
import postClasses from "../../../../styles/Post.module.css";
import {CAvatar} from "../../../CImage";
import Link from "next/link";
import moment from "moment";
import "moment/locale/ru";
import {useState} from "react";
import {useInterval} from "../../../../lib/client-api";

export function Countdown({timestamp}) {
  const [,setDate] = useState(null);
  useInterval(() => {
    setDate(Date.now());
  }, 1000);

  return moment(timestamp).locale("ru").calendar();
}

export default function UserActivityPage({page}) {
  return <section className={classes.activity}>
    <header className={classes.activityHeader}>
      <CAvatar link={`/activity/${page.id}`} id={page.fandom.imageId} />
      <div className={postClasses.headerText}>
        <div className={postClasses.headerTitle}>
          <Link href={`/activity/${page.id}`}>
            <a className={postClasses.headerFandom}>{page.name}</a>
          </Link>
        </div>
        <div className={classes.headerSecondary}>
          <Link href={`/fandom/${page.fandom.id}`}>
            <a className={postClasses.headerAuthor}>{page.fandom.name}</a>
          </Link>
        </div>
      </div>
    </header>
    <div className={classes.activityDescription}>
      {page.description}
    </div>
    <div className={classes.activityHeader}>
      <CAvatar account={page.currentAccount} />
      <div className={postClasses.headerText}>
        <div className={postClasses.headerTitle}>
          <span className={postClasses.headerAuthor}>
            Следующий:&nbsp;
          </span>
          <Link href={`/activity/${page.id}`}>
            <a className={classes.activityNext}>{page.currentAccount.J_NAME}</a>
          </Link>
        </div>
        <div className={classes.activityDue}>
          <span className={postClasses.headerAuthor}>истекает&nbsp;</span>
          <Countdown timestamp={page.tag_2 + 3600000 * 24} />
        </div>
      </div>
    </div>
  </section>;
}
