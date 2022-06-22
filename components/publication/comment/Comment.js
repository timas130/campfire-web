import classes from "../../../styles/Comment.module.css";
import CImage, {CAvatar} from "../../CImage";
import dayjs from "../../../lib/time";
import Link from "next/link";
import FormattedText from "../../FormattedText";
import Karma from "../../Karma";
import React, {useRef, useState} from "react";
import classNames from "classnames";
import {limitText} from "../../../lib/text-cover";
import {ReplyIcon, XIcon} from "@heroicons/react/solid";
import {CommentEditor} from "./Comments";
import {AccountLink} from "../../FandomHeader";

// todo: multiple images in one comment

function CommentQuote({jsonDB}) {
  let text = jsonDB.quoteText;
  if (jsonDB.quoteCreatorName) {
    const otherName = jsonDB.quoteCreatorName + ":";
    if (text.startsWith(otherName)) {
      text = text.substring(otherName.length);
    }
  }
  if (typeof jsonDB.quoteImages === "string") {
    jsonDB.quoteImages = JSON.parse(jsonDB.quoteImages);
  }

  return <div className={classes.quote}>
    <FormattedText text={
      (jsonDB.quoteCreatorName ? `{_cweb_secondary ${jsonDB.quoteCreatorName}:}` : "") +
      limitText(text, 64, 150)
    } />
    {jsonDB.quoteStickerImageId > 0 && <Link href={`/stickers/sticker/${jsonDB.quoteStickerId}`}>
      <a className={classes.image}>
        <CImage
          id={jsonDB.quoteStickerImageId} w={100} h={100}
          loading="lazy" alt="Стикер"
        />
      </a>
    </Link>}
    {(jsonDB.quoteImages || []).length !== 0 && <div className={classes.image}><CImage
      id={jsonDB.quoteImages[0]} w={100} h={100}
      loading="lazy" modal objectFit="cover" alt="Изображение"
    /></div>}
  </div>;
}

function Comment({comment, bestComment = false, full = false, id, reply, replyLoading, element}, ref) {
  const jsonDB = typeof comment.jsonDB === "string" ? JSON.parse(comment.jsonDB) : comment.jsonDB;
  const [replyEditorShown, setReplyEditorShown] = useState(false);
  const replyBtnRef = useRef();
  const replyFormRef = useRef();

  return <article className={classNames(classes.comment, bestComment && classes.best, full && classes.full)}
                  ref={ref} id={id}>
    <header className={classes.header}>
      <CAvatar account={comment.creator} small className={classes.avatar} />
      <AccountLink account={comment.creator} className={classes.author} />&nbsp;
      <time dateTime={dayjs(comment.dateCreate).toISOString()} className={classes.time}>
        {dayjs(comment.dateCreate).locale("ru").fromNow()}
      </time>
      {comment.changed && <span className={classes.time}>(ред.)</span>}
      {full && <>&nbsp;<Link href={`/post/${comment.parentUnitId}`}>
        <a className={classes.openPost}>Открыть пост</a>
      </Link></>}
    </header>
    <div className={classes.content}>
      {jsonDB.quoteId !== 0 && <CommentQuote jsonDB={jsonDB} />}
      <FormattedText text={jsonDB.J_TEXT} />
      {jsonDB.stickerImageId !== 0 && <Link href={`/stickers/sticker/${jsonDB.stickerId}`}>
        <a className={classes.image}>
          <CImage
            id={jsonDB.stickerImageId} w={128} h={128}
            loading="lazy" alt="Стикер"
          />
        </a>
      </Link>}
      {jsonDB.imageId !== 0 && <div className={classes.image}><CImage
        id={jsonDB.imageId}
        w={jsonDB.imageW} h={jsonDB.imageH}
        loading="lazy" modal
        alt="Изображение"
      /></div>}
    </div>
    <div className={classes.footer}>
      <Karma pub={comment} small />
      {reply && <span className={classes.footerReply} tabIndex={0}
                      onClick={() => setReplyEditorShown(a => !a)}>
        {replyEditorShown ? <XIcon /> : <ReplyIcon />}
        {replyEditorShown ? "Закрыть" : "Ответить"}
      </span>}
    </div>
    {reply && replyEditorShown && <CommentEditor
      isReply
      element={element}
      isLoading={replyLoading}
      submitBtnRef={replyBtnRef}
      formRef={replyFormRef}
      submit={ev => {
        ev.preventDefault();
        const data = new FormData(ev.target);
        const content = data.get("content");
        reply(content, comment.id, replyBtnRef.current)
          .then(close => close && setReplyEditorShown(false));
      }}
      hideSelf={() => setReplyEditorShown(false)}
    />}
  </article>;
}

export default React.forwardRef(Comment);
