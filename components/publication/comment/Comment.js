import classes from "../../../styles/Comment.module.css";
import CImage, {CAvatar} from "../../CImage";
import dayjs from "../../../lib/time";
import Link from "next/link";
import FormattedText from "../../FormattedText";
import Karma from "../../Karma";
import React, {useRef, useState} from "react";
import classNames from "classnames";
import {limitText} from "../../../lib/text-cover";
import {DotsVerticalIcon, ReplyIcon, XIcon} from "@heroicons/react/solid";
import {CommentEditor} from "./Comments";
import {AccountLink} from "../../FandomHeader";
import Button from "../../controls/Button";
import Reactions from "../Reactions";
import {Dropdown, DropdownItem, DropdownSection} from "../../controls/Dropdown";
import {CommentModerationEntries, CommentModerationProvider} from "../../moderation/PostModeration";
import {useModalState} from "../../../lib/ui";
import KarmaVotesModel from "../KarmaVotesModal";

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

  return (
    <div className={classes.quote}>
      <FormattedText text={
        (jsonDB.quoteCreatorName ? `{_cweb_secondary ${jsonDB.quoteCreatorName}:}` : "") +
        limitText(text, 64, 150)
      } />
      {jsonDB.quoteStickerImageId > 0 && <Link
        href={`/stickers/sticker/${jsonDB.quoteStickerId}`}
        className={classes.images}>

        <CImage
          id={jsonDB.quoteStickerImageId} w={100} h={100}
          loading="lazy" alt="Стикер"
        />
      </Link>}
      {(jsonDB.quoteImages || []).length > 0 && <div className={classes.images}>
        {jsonDB.quoteImages.map(id => <CImage
          key={id} id={id} w={100} h={100}
          loading="lazy" modal objectFit="cover" alt="Изображение"
        />)}
      </div>}
    </div>
  );
}

function makeLink(type, id) {
  switch (type) {
    case 9: return `/post/${id}`;
    case 11: return `/mod/${id}`;
    case 15: return `/stickers/${id}`;
    default: return `/post/${id}`;
  }
}

function isShitty(text) {
  const t = text.toLowerCase().replace(/,/g, "");
  return t.search(/гейм ди|сит ди|ид тис|ид мйег|game go|og emag|гейм иди|сит иди/) !== -1;
}

function Comment({comment, bestComment = false, full = false, id, reply, replyLoading, element}, ref) {
  const jsonDB = typeof comment.jsonDB === "string" ? JSON.parse(comment.jsonDB) : comment.jsonDB;
  const imageIdArray = typeof jsonDB.imageIdArray === "string" ? JSON.parse(jsonDB.imageIdArray) : jsonDB.imageIdArray;
  const imageWArray = typeof jsonDB.imageWArray === "string" ? JSON.parse(jsonDB.imageWArray) : jsonDB.imageWArray;
  const imageHArray = typeof jsonDB.imageHArray === "string" ? JSON.parse(jsonDB.imageHArray) : jsonDB.imageHArray;

  const [replyEditorShown, setReplyEditorShown] = useState(false);
  const [forceShow, setForceShow] = useState(false);
  const replyBtnRef = useRef();
  const replyFormRef = useRef();

  const [reactions, setReactions] = useState(jsonDB.reactions);
  const [showReactions, setShowReactions] = useState(false);

  const karmaModal = useModalState();

  if (isShitty(jsonDB.J_TEXT) && !forceShow) {
    return <article
      className={classNames(classes.comment, bestComment && classes.best, full && classes.full, classes.shitty)}
      ref={ref} id={id}
    >
      <div className={classes.content}>Комментарий скрыт.</div>
      <Button onClick={() => setForceShow(true)}>Показать</Button>
    </article>;
  }

  const inner = <article
    className={classNames(classes.comment, bestComment && classes.best, full && classes.full)}
    ref={ref} id={id}
  >
    <KarmaVotesModel id={comment.id} close={karmaModal.close} isOpen={karmaModal.isOpen} />
    <div className={classes.left}>
      <CAvatar account={comment.creator} small className={classes.avatar} />
    </div>
    <div className={classes.right}>
      <header className={classes.header}>
        <AccountLink account={comment.creator} className={classes.author} />&nbsp;
        <time dateTime={dayjs(comment.dateCreate).toISOString()} className={classes.time}>
          {dayjs(comment.dateCreate).locale("ru").fromNow()}
        </time>
        {jsonDB.changed && <span className={classes.time}>&nbsp;(ред.)</span>}
        {full && <>&nbsp;<Link
          href={makeLink(comment.parentUnitType, comment.parentUnitId)}
          className={classes.openPost}>
          Открыть пост
        </Link></>}
        <Dropdown rootClassName={!full && classes.moreDropdown}
                  activator={<DotsVerticalIcon />}
                  activatorClassName={classes.moreButton}>
          <DropdownSection>
            {(reactions && (reactions.length === 0 || reactions === "[]")) && (
              <DropdownItem onClick={() => setShowReactions(a => !a)}>
                {showReactions ? "Скрыть реакции" : "Показать реакции"}
              </DropdownItem>)}
            <DropdownItem onClick={karmaModal.open}>
              Посмотреть оценки
            </DropdownItem>
          </DropdownSection>
          <CommentModerationEntries />
        </Dropdown>
      </header>
      <div className={classes.content}>
        {jsonDB.quoteId > 0 && <CommentQuote jsonDB={jsonDB} />}
        <FormattedText text={jsonDB.J_TEXT} />
        {jsonDB.stickerImageId > 0 && <Link href={`/stickers/sticker/${jsonDB.stickerId}`} className={classes.images}>
          <CImage
            id={jsonDB.stickerImageId} w={128} h={128}
            loading="lazy" alt="Стикер"
          />
        </Link>}
        {(jsonDB.imageId > 0 || (imageIdArray || []).length > 0) && <div className={classes.images}>
          {jsonDB.imageId > 0 && <div className={classes.image} key={jsonDB.imageId}><CImage
            id={jsonDB.imageId}
            maxSide={256}
            w={jsonDB.imageW} h={jsonDB.imageH}
            loading="lazy" modal
            alt="Изображение"
          /></div>}
          {(imageIdArray || []).map((id, idx) => <div className={classes.image} key={id}><CImage
            id={id}
            maxSide={256}
            w={imageWArray[idx]} h={imageHArray[idx]}
            loading="lazy" modal
            alt="Изображение"
          /></div>)}
        </div>}
      </div>
      <div className={classes.footer}>
        <Karma pub={comment} small />
        {reply && <span className={classes.footerReply} tabIndex={0}
                        onClick={() => setReplyEditorShown(a => !a)}>
          {replyEditorShown ? <XIcon /> : <ReplyIcon />}
          {replyEditorShown ? "Закрыть" : "Ответить"}
        </span>}
      </div>
      <Reactions reactions={reactions} setReactions={setReactions} id={comment.id} shown={showReactions} />
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
    </div>
  </article>;

  return <CommentModerationProvider pub={comment}>
    {inner}
  </CommentModerationProvider>;
}

export default React.forwardRef(Comment);
