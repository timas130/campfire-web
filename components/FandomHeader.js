import classes from "../styles/Post.module.css";
import classNames from "classnames";
import {CAvatar} from "./CImage";
import Link from "next/link";

// this is

export default function FandomHeader(props) {
  const {
    fandom, className, pinned, imageId, name,
    link, addTitle, author, authorLink,
    addSecondary, addRight, noPadding,
    onClick, dense,
  } = props;
  return <header className={className || classNames(
    classes.header,
    pinned && classes.pinned,
    noPadding && classes.noPadding,
    dense && classes.dense,
    onClick && classes.clickable,
  )} onClick={onClick}>
    {Boolean(fandom || imageId) && <CAvatar fandom={fandom} id={imageId} alt={name} link={link} />}
    <div className={classes.headerText}>
      <div className={classes.headerTitle}>
        {onClick ?
          <span className={classes.headerFandom}>{name || fandom.name}</span> :
          <Link href={link || `/fandom/${fandom.id}`}>
            <a className={classes.headerFandom}>{name || fandom.name}</a>
          </Link>}
        {addTitle}
      </div>
      <div className={classes.headerSecondary}>
        {authorLink ? <Link href={authorLink}>
          <a className={classes.headerAuthor}>{author}</a>
        </Link> : <span className={classes.headerAuthor}>{author}</span>}
        {addSecondary && <>&nbsp;•&nbsp;{addSecondary}</>}
      </div>
    </div>
    {addRight}
  </header>;
}
