import classes from "../../styles/Comment.module.css";
import {CAvatar} from "../CImage";
import moment from "moment";
import Link from "next/link";
import FormattedText from "../FormattedText";
import Karma from "../Karma";

export default function Comment({ comment }) {
  const jsonDB = typeof comment.jsonDB === "string" ? JSON.parse(comment.jsonDB) : comment.jsonDB;
  return <article className={classes.comment}>
    <header className={classes.header}>
      <CAvatar account={comment.creator} small className={classes.avatar} />
      <Link href={`/account/${comment.creator.J_NAME}`}>
        <a className={classes.author}>{comment.creator.J_NAME}</a>
      </Link>&nbsp;
      <time dateTime={moment(comment.dateCreate).toISOString()} className={classes.time}>
        {moment(comment.dateCreate).locale("ru").fromNow()}
      </time>
    </header>
    <div className={classes.content}>
      {jsonDB.quoteCreatorName && <span className={classes.quote}>{jsonDB.quoteCreatorName}, </span>}
      <FormattedText text={jsonDB.J_TEXT} />
    </div>
    <div className={classes.footer}>
      <Karma
        karmaCount={comment.karmaCount}
        myKarma={comment.myKarma}
        small
      />
    </div>
  </article>;
}
