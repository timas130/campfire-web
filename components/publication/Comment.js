import classes from "../../styles/Comment.module.css";
import {CAvatar} from "../CImage";
import moment from "moment";
import Link from "next/link";
import FormattedText from "../FormattedText";
import Karma from "../Karma";
import React from "react";

export default React.forwardRef(function Comment({ comment }, ref) {
  const jsonDB = typeof comment.jsonDB === "string" ? JSON.parse(comment.jsonDB) : comment.jsonDB;
  return <article className={classes.comment} ref={ref}>
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
      {/* TODO: add actual quotes */}
      {jsonDB.quoteCreatorName && <span className={classes.quote}>{jsonDB.quoteCreatorName}, </span>}
      <FormattedText text={jsonDB.J_TEXT} />
    </div>
    <div className={classes.footer}>
      <Karma
        pub={comment} pubId={comment.id}
        karmaCount={comment.karmaCount}
        myKarma={comment.myKarma} small
      />
    </div>
  </article>;
});
