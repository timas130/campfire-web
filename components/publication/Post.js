import classes from "../../styles/Post.module.css";
import {CAvatar} from "../CImage";
import Link from "next/link";
import moment from "moment";
import "moment/locale/ru";
import classNames from "classnames";
import {ChatAlt2Icon, ChevronDownIcon, ChevronUpIcon, DotsVerticalIcon} from "@heroicons/react/solid";
import Karma from "../Karma";
import {Page} from "./pages/Page";
import {useRef, useState} from "react";

function CommentCounter(props) {
  return <Link href={props.href}>
    <a className={classes.commentCounter}>
      <ChatAlt2Icon className={classes.commentIcon} />
      {props.count}
    </a>
  </Link>;
}

export default function Post(props) {
  const {post, alwaysExpanded} = props;
  const [expanded, setExpanded] = useState(Boolean(alwaysExpanded));
  const contentRef = useRef();

  if (typeof post.jsonDB.J_PAGES !== "object") {
    post.jsonDB.J_PAGES = JSON.parse(post.jsonDB.J_PAGES);
  }
  return <article className={classes.post}>
    <header className={classes.header}>
      <CAvatar
        id={post.fandom.imageId}
        alt={post.fandom.name}
        link={`/fandom/${post.fandom.id}`}
      />
      <div className={classes.headerText}>
        <div className={classes.headerTitle}>
          <Link href={`/fandom/${post.fandom.id}`}>
            <a className={classes.headerFandom}>{post.fandom.name}</a>
          </Link>
          &nbsp;
          {post.rubricId !== 0 && <Link href={`/rubric/${post.rubricId}`}>
            <a className={classNames(classes.headerRubric)}>
              в {post.rubricName}
            </a>
          </Link>}
          {post.userActivity && <Link href={`/activity/${post.userActivity.id}`}>
            <a className={classNames(classes.headerRubric)}>
              в {post.userActivity.name}
            </a>
          </Link>}
        </div>
        <div className={classes.headerSecondary}>
          <Link href={`/account/${post.creator.J_NAME}`}>
            <a className={classes.headerAuthor}>{post.creator.J_NAME}</a>
          </Link>
          &nbsp;•&nbsp;
          <time dateTime={moment(post.dateCreate).toISOString()}>
            {moment(post.dateCreate).locale("ru").fromNow()}
          </time>
        </div>
      </div>
      <DotsVerticalIcon className={classes.headerMore} />
    </header>
    <div className={classNames(classes.content, expanded && classes.expanded)} ref={contentRef}>
      {post.jsonDB.J_PAGES.map((page, idx) => <Page key={idx} page={page} />)}
    </div>
    <div className={classes.footer}>
      {!alwaysExpanded && <div className={classes.expander} onClick={() => setExpanded(x => !x)}>
        {expanded ?
          <ChevronUpIcon className={classes.expandIcon} /> :
          <ChevronDownIcon className={classes.expandIcon} />}
        {expanded ? "Свернуть" : "Развернуть"}
      </div>}
      <div className={classes.spacer} />
      <CommentCounter href="/post/1234#comments" count={post.subUnitsCount} />
      <Karma pubid={post.id} karmaCount={post.karmaCount} myKarma={post.myKarma} />
    </div>
  </article>;
}
