import classes from "../styles/Post.module.css";
import classNames from "classnames";
import {CAvatar} from "./CImage";
import Link from "next/link";
import {BoxPlaceholder, TextPlaceholder} from "./Placeholder";
import React from "react";

function FandomHeader(props) {
  const {
    fandom, className, pinned, imageId, name,
    link, addTitle, author, authorLink,
    addSecondary, addRight, noPadding,
    onClick, dense, addLeft, el, account,
    allowOverflow = 0, avatarLink,
    smallIcon, alignStart, noLink,
  } = props;
  const El = el || "div";

  const nameL =
    name ? name :
    fandom ? fandom.name :
    account.J_NAME;

  const linkL = !noLink ? link ? link :
    fandom ? `/fandom/${fandom.id}` :
    account ? `/account/${encodeURIComponent(account.J_NAME)}` :
    null : null;

  return (
    <El className={className || classNames(
      classes.header,
      pinned && classes.pinned,
      noPadding && classes.noPadding,
      dense && classes.dense,
      onClick && classes.clickable,
      smallIcon && classes.smallIcon,
      alignStart && classes.alignStart,
    )} onClick={onClick} tabIndex={onClick ? 0 : undefined}>
      {Boolean(account || fandom || imageId) &&
        <CAvatar account={account} fandom={fandom} id={imageId} alt={name} link={avatarLink || link} />}
      {addLeft}
      <div className={classes.headerText}>
        <div className={classNames(
          classes.headerTitle,
          (allowOverflow & 0b1) && classes.allowOverflow
        )}>
          {(onClick || !linkL) ?
            <span className={classes.headerFandom}>{nameL}</span> :
            <Link href={linkL} className={classes.headerFandom}>

              {nameL}<SponsorStar account={account} />

            </Link>}
          {addTitle}
        </div>
        <div className={classNames(
          classes.headerSecondary,
          (allowOverflow & 0b10) && classes.allowOverflow
        )}>
          {authorLink ? <Link href={authorLink} className={classes.headerAuthor}>
            {author}
          </Link> : <span className={classes.headerAuthor}>{author}</span>}
          {addSecondary && <>&nbsp;•&nbsp;{addSecondary}</>}
        </div>
      </div>
      {addRight}
    </El>
  );
}

export function ShortAccountLink({name, addRight, className, reset, ...rest}) {
  return (
    <Link
      href={`/account/${encodeURIComponent(name)}`}
      className={classNames(reset && classes.reset, className)}
      {...rest}>
      {name}{addRight}
    </Link>
  );
}

export function AccountLink({account, showTimes, ...rest}) {
  return <ShortAccountLink
    name={account.J_NAME}
    addRight={<SponsorStar showTimes={showTimes} account={account} />}
    {...rest}
  />;
}

export function SponsorStar() {
  return null;
}

export default React.memo(FandomHeader);

export function FandomHeaderPlaceholder(props) {
  const {className, noPadding, dense} = props;
  return <header className={className || classNames(
    classes.header,
    noPadding && classes.noPadding,
    dense && classes.dense,
  )}>
    <BoxPlaceholder w={40} h={40} />
    <div className={classes.headerText}>
      <div className={classes.headerTitle}>
        <TextPlaceholder className={classes.headerFandom} w={70} />
      </div>
      <div className={classes.headerSecondary}>
        <TextPlaceholder classes={classes.headerAuthor} w={200} />
      </div>
    </div>
  </header>;
}
