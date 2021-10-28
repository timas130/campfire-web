import classes from "../../styles/Comment.module.css";
import CImage, {CAvatar} from "../CImage";
import moment from "moment";
import Link from "next/link";
import FormattedText from "../FormattedText";
import Karma from "../Karma";
import React from "react";
import classNames from "classnames";
import {limitText} from "../../lib/text-cover";

// todo: multiple images in one comment

function CommentQuote({jsonDB}) {
  let text = jsonDB.quoteText;
  if (jsonDB.quoteCreatorName) {
    const otherName = jsonDB.quoteCreatorName + ":";
    if (text.startsWith(otherName)) {
      text = text.substring(otherName.length);
    }
  }

  return <div className={classes.quote}>
    <FormattedText text={
      (jsonDB.quoteCreatorName ? `{90A4AE ${jsonDB.quoteCreatorName}:}` : "") +
      limitText(text, 64, 150)
    } />
    {jsonDB.quoteImages.length !== 0 && <div className={classes.image}><CImage
      id={jsonDB.quoteImages[0]} w={100} h={100}
      loading="lazy" modal objectFit="cover" alt="Изображение"
    /></div>}
  </div>;
}

export default React.forwardRef(function Comment({ comment, bestComment = false, full = false }, ref) {
  const jsonDB = typeof comment.jsonDB === "string" ? JSON.parse(comment.jsonDB) : comment.jsonDB;
  return <article className={classNames(classes.comment, bestComment && classes.best, full && classes.full)} ref={ref}>
    <header className={classes.header}>
      <CAvatar account={comment.creator} small className={classes.avatar} />
      <Link href={`/account/${encodeURIComponent(comment.creator.J_NAME)}`}>
        <a className={classes.author}>{comment.creator.J_NAME}</a>
      </Link>&nbsp;
      <time dateTime={moment(comment.dateCreate).toISOString()} className={classes.time}>
        {moment(comment.dateCreate).locale("ru").fromNow()}
      </time>
      {comment.changed && <span className={classes.time}>(ред.)</span>}
      {full && <>&nbsp;<Link href={`/post/${comment.parentUnitId}`}>
        <a className={classes.openPost}>Открыть пост</a>
      </Link></>}
    </header>
    <div className={classes.content}>
      {jsonDB.quoteId !== 0 && <CommentQuote jsonDB={jsonDB} />}
      <FormattedText text={jsonDB.J_TEXT} />
      {jsonDB.imageId !== 0 && <div className={classes.image}><CImage
        id={jsonDB.imageId}
        w={jsonDB.imageW} h={jsonDB.imageH}
        loading="lazy" modal
        alt="Изображение"
      /></div>}
    </div>
    <div className={classes.footer}>
      <Karma pub={comment} small />
    </div>
  </article>;
});
