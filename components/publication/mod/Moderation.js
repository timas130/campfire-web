import classes from "../../../styles/Post.module.css";
import dayjs from "../../../lib/time";
import FandomHeader from "../../FandomHeader";
import Link from "next/link";
import FormattedText from "../../FormattedText";
import Tooltip from "../../Tooltip";
import CImage from "../../CImage";
import ShareButton from "../../controls/ShareButton";
import {useRouter} from "next/router";
import {CommentCounter} from "../post/Post";
import Karma from "../../Karma";

const moderationTypes = {
  1: ModerationBlock,
  2: ModerationTagCreate,
  3: ModerationTagChange,
  4: ModerationTagRemove,
  5: ModerationDescription,
  6: ModerationGalleryAdd,
  7: ModerationGalleryRemove,
  8: ModerationTitleImage,
  9: ModerationImportant,
  10: ModerationLinkAdd,
  11: ModerationLinkRemove,
  12: ModerationToDrafts,
  13: ModerationPostTags,
  14: ModerationNames,
  15: ModerationForgive,
};

function AccLink({name, className}) {
  return <Link href={`/account/${encodeURIComponent(name)}`}>
    <a className={className}>@{name}</a>
  </Link>;
}
function MLink({pub}) {
  return <AccLink name={pub.creator.J_NAME} className={classes.modAdminLink} />;
}
function TLink({pub}) {
  return <AccLink name={pub.jsonDB.moderation.accountName} className={classes.modUserLink} />;
}
function MSex({pub, she, he}) {
  return pub.creator.sex === 1 ? (she.startsWith("+") ? (he + she.substring(1)) : she) : he;
}
function MCheck({pub}) {
  return <div className={classes.modContent}>
    {pub.jsonDB.moderation.checkAdminId ?
      (pub.jsonDB.moderation.checkAdminComment ?
        <>
          <span className={classes.modAdminReject}>Отклонено </span>
          <AccLink name={pub.jsonDB.moderation.checkAdminName} />.
          <div className={classes.modRejectComment}>
            {pub.jsonDB.moderation.checkAdminComment}
          </div>
        </> :
        <>
          <span className={classes.modAdminAccept}>Проверено </span>
          <AccLink name={pub.jsonDB.moderation.checkAdminName} />.
        </>) :
      <FormattedText text="{_cweb_secondary Ещё не проверено администратором}" />}
  </div>;
}
function MComment({pub}) {
  return <div className={classes.modContent}>
    Комментарий: {pub.jsonDB.moderation.comment}
  </div>;
}

function ModerationUnknown() {
  return <div className={classes.modContent}>
    <FormattedText text="{_cweb_secondary Произошла ошибка: не найден тип модерации. Скоро™ будет!}" />
  </div>;
}

function ModerationBlock({pub}) {
  return <>
    <div className={classes.modContent}>
      Модератор <MLink pub={pub} /> <MSex pub={pub} he="заблокировал" she="+а" /> публикацию
      пользователя <TLink pub={pub} />.
    </div>
    <MComment pub={pub} />
    {pub.jsonDB.moderation.accountBlockDate > 0 && <div className={classes.modContent}>
      Пользователь заблокирован
      до {dayjs(pub.jsonDB.moderation.accountBlockDate).locale("ru").calendar()}
    </div>}
    {pub.jsonDB.moderation.lastUnitsBlocked && <div className={classes.modContent}>
      Последние публикации пользователя заблокированы.
    </div>}
    <MCheck pub={pub} />
  </>;
}

function ModerationTagCreate({pub}) {
  return <>
    <div className={classes.modContent}>
      Модератор <MLink pub={pub} /> <MSex pub={pub} he="создал" she="+а" /> тег
      &quot;{pub.jsonDB.moderation.tagName}&quot; в категории
      &quot;{pub.jsonDB.moderation.tagParentName}&quot;.
    </div>
    <MComment pub={pub} />
  </>;
}

function ModerationTagChange({pub}) {
  const imageChanged = pub.jsonDB.moderation.tagOldImageId !== 0 && pub.jsonDB.moderation.tagImageId !== 0;
  return <>
    <div className={classes.modContent}>
      Модератор <MLink pub={pub} /> <MSex pub={pub} he="изменил" she="+а" /> тег
      &quot;{pub.jsonDB.moderation.tagOldName}&quot; в категории
      &quot;{pub.jsonDB.moderation.tagParentName}&quot;.
    </div>
    {pub.jsonDB.moderation.tagOldName !== pub.jsonDB.moderation.tagName && <div className={classes.modContent}>
      Изменено имя: было &quot;{pub.jsonDB.moderation.tagOldName}&quot;, стало
      &quot;pub.jsonDB.moderation.tagName&quot;.
    </div>}
    {imageChanged && <div className={classes.modContent}>
      Изменена иконка тега.
    </div>}
    <MComment pub={pub} />
  </>;
}

function ModerationTagRemove({pub}) {
  return <>
    <div className={classes.modContent}>
      Модератор <MLink pub={pub} /> <MSex pub={pub} he="удалил" she="+а" /> тег
      &quot;{pub.jsonDB.moderation.tagName}&quot; в категории
      &quot;{pub.jsonDB.moderation.tagParentName}&quot;.
    </div>
    <MComment pub={pub} />
  </>;
}

function ModerationDescription({pub}) {
  return <>
    <div className={classes.modContent}>
      Модератор <MLink pub={pub} /> <MSex pub={pub} he="изменил" she="+а" /> описание фэндома.
    </div>
    <div className={classes.modContent}>
      <b>Стало:</b><br/>
      <FormattedText text={pub.jsonDB.moderation.description} />
    </div>
    <MComment pub={pub} />
  </>;
}

function ModerationGalleryAdd({pub}) {
  return <>
    <div className={classes.modContent}>
      Модератор <MLink pub={pub} /> <MSex pub={pub} he="добавил" she="+а" /> изображение
      в галерею фэндома:
    </div>
    <div className={classes.modImage}>
      <CImage id={pub.jsonDB.moderation.imageId} useImg alt="Изображение удалено" />
    </div>
    <MComment pub={pub} />
  </>;
}

function ModerationGalleryRemove({pub}) {
  return <>
    <div className={classes.modContent}>
      Модератор <MLink pub={pub} /> <MSex pub={pub} he="удалил" she="+а" /> изображение
      из галереи фэндома.
    </div>
    <MComment pub={pub} />
  </>;
}

function ModerationTitleImage({pub}) {
  return <>
    <div className={classes.modContent}>
      Модератор <MLink pub={pub} /> <MSex pub={pub} he="изменил" she="+а" /> фон
      фэндома.
    </div>
    <MComment pub={pub} />
  </>;
}

function ModerationImportant({pub}) {
  return <>
    {pub.jsonDB.moderation.isImportant ? <div className={classes.modContent}>
      Модератор <MLink pub={pub} /> <MSex pub={pub} he="добавил" she="+а" /> метку
      важности к посту <Link href={`/post/${pub.jsonDB.moderation.importantUnitId}`}><a>
        @post_{pub.jsonDB.moderation.importantUnitId}
      </a></Link>.
    </div> : <div className={classes.modContent}>
      Модератор <MLink pub={pub} /> <MSex pub={pub} he="убрал" she="+а" /> метку
      важности с поста <Link href={`/post/${pub.jsonDB.moderation.importantUnitId}`}><a>
        @post_{pub.jsonDB.moderation.importantUnitId}
      </a></Link>.
    </div>}
    <MComment pub={pub} />
  </>;
}

function ModerationLinkAdd({pub}) {
  return <>
    <div className={classes.modContent}>
      Модератор <MLink pub={pub} /> <MSex pub={pub} he="добавил" she="+а" /> ссылку
      в фэндом.
    </div>
    <div className={classes.modContent}>
      Название: {pub.jsonDB.moderation.title}<br />
      Ссылка: <a href={pub.jsonDB.moderation.url} target="_blank" rel="noreferrer nofollow">
        {pub.jsonDB.moderation.url}
      </a>
    </div>
    <MComment pub={pub} />
  </>;
}

function ModerationLinkRemove({pub}) {
  return <>
    <div className={classes.modContent}>
      Модератор <MLink pub={pub} /> <MSex pub={pub} he="убрал" she="+а" /> ссылку
      из фэндома.
    </div>
    <MComment pub={pub} />
  </>;
}

function ModerationToDrafts({pub}) {
  return <>
    <div className={classes.modContent}>
      Модератор <MLink pub={pub} /> <MSex pub={pub} he="переместил" she="+а" /> пост&nbsp;
      <Link href={`/post/${pub.jsonDB.moderation.unitId}`}><a>
        @post_{pub.jsonDB.moderation.unitId}
      </a></Link> пользователя <TLink pub={pub} /> в черновики.
    </div>
    <MComment pub={pub} />
  </>;
}

function ModerationPostTags({pub}) {
  return <>
    <div className={classes.modContent}>
      Модератор <MLink pub={pub} /> <MSex pub={pub} he="изменил" she="+а" /> теги поста&nbsp;
      <Link href={`/post/${pub.jsonDB.moderation.unitId}`}><a>
        @post_{pub.jsonDB.moderation.unitId}
      </a></Link>.
    </div>
    {pub.jsonDB.moderation.newTags.length > 0 && <div className={classes.modContent}>
      Добавлены теги: {pub.jsonDB.moderation.newTags.join(", ")}
    </div>}
    {pub.jsonDB.moderation.removedTags.length > 0 && <div className={classes.modContent}>
      Убраны теги: {pub.jsonDB.moderation.removedTags.join(", ")}
    </div>}
    <MComment pub={pub} />
  </>;
}

function ModerationNames({pub}) {
  return <>
    <div className={classes.modContent}>
      Модератор <MLink pub={pub} /> <MSex pub={pub} he="изменил" she="+а" /> доп.
      имена фэндома.
    </div>
    {pub.jsonDB.moderation.newNames.length > 0 && <div className={classes.modContent}>
      Добавлены: {pub.jsonDB.moderation.newNames.join(", ")}
    </div>}
    {pub.jsonDB.moderation.removedNames.length > 0 && <div className={classes.modContent}>
      Убраны: {pub.jsonDB.moderation.removedNames.join(", ")}
    </div>}
    <MComment pub={pub} />
  </>;
}

function ModerationForgive({pub}) {
  return <>
    <div className={classes.modContent}>
      Модератор <MLink pub={pub} /> <MSex pub={pub} he="помиловал" she="+а" /> пользователя&nbsp;
      <TLink pub={pub} />.
    </div>
    <MComment pub={pub} />
  </>;
}

export default function Moderation({pub}) {
  const ContentEl = moderationTypes[pub.jsonDB.moderation.type] || ModerationUnknown;
  const router = useRouter();

  return <article className={classes.post}>
    <FandomHeader
      el="header"
      fandom={pub.fandom}
      author={"Модер " + pub.creator.J_NAME}
      authorLink={`/account/${encodeURIComponent(pub.creator.J_NAME)}`}
      addSecondary={<>
        {pub.jsonDB.moderation.accountId && <>
          <Link href={`/account/${encodeURIComponent(pub.jsonDB.moderation.accountId)}`}>
            <a className={classes.headerAuthor}>Юзер {pub.jsonDB.moderation.accountName}</a>
          </Link> •&nbsp;
        </>}
        <Tooltip text={dayjs(pub.dateCreate).locale("ru").calendar()}>
          {dayjs(pub.dateCreate).locale("ru").fromNow()}
        </Tooltip>
      </>}
    />
    <ContentEl pub={pub} />
    <div className={classes.footer}>
      <div className={classes.spacer} />
      <ShareButton link={router.basePath + `/mod/${pub.id}`} />
      <CommentCounter target={null} href={`/mod/${pub.id}#comments`} count={pub.subUnitsCount} />
      <Karma pub={pub} />
    </div>
  </article>;
}
