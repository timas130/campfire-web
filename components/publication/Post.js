import classes from "../../styles/Post.module.css";
import {CAvatar} from "../CImage";
import Link from "next/link";
import moment from "moment";
import "moment/locale/ru";
import classNames from "classnames";
import {ChatAlt2Icon, ChevronDownIcon, ChevronUpIcon, DotsVerticalIcon} from "@heroicons/react/solid";
import Karma from "../Karma";
import {useEffect, useRef, useState} from "react";
import ShareButton from "../ShareButton";
import {useRouter} from "next/router";
import Pages from "./pages/Pages";

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
  const router = useRouter();
  const [expandedManually, setExpandedManually] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [expandable, setExpandable] = useState(false);
  const contentRef = useRef();

  useEffect(() => {
    if (! alwaysExpanded) {
      const rect = contentRef.current.getBoundingClientRect();
      setExpandable(rect.height > 512);
    }
  }, [alwaysExpanded]);
  useEffect(() => {
    if (expandedManually && !expanded) {
      // when collapsing scroll into view with offset
      const bodyRect = document.body.getBoundingClientRect().top;
      const elRect = contentRef.current.getBoundingClientRect().bottom;
      const elPosition = elRect - bodyRect - 100;
      window.scrollTo({
        top: elPosition
      });
      setExpandedManually(false);
    }
  }, [expandedManually, expanded]);

  const toggleExpand = () => {
    setExpandedManually(true);
    setExpanded(ex => !ex);
  };

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
    <div className={classNames(
      classes.content,
      (alwaysExpanded || expanded || !expandable) && classes.expanded
    )} ref={contentRef}>
      <Pages pages={post.jsonDB.J_PAGES} />
      {/*{post.jsonDB.J_PAGES.map((page, idx) => <Page key={idx} page={page} />)}*/}
    </div>
    <div className={classes.footer}>
      {expandable && <div className={classes.expander} onClick={toggleExpand}>
        {expanded ?
          <ChevronUpIcon className={classes.expandIcon} /> :
          <ChevronDownIcon className={classes.expandIcon} />}
        {expanded ? "Свернуть" : "Развернуть"}
      </div>}
      <div className={classes.spacer} />
      <ShareButton link={router.basePath + `/post/${post.id}`} />
      <CommentCounter href={`/post/${post.id}#comments`} count={post.subUnitsCount} />
      <Karma pubId={post.id} karmaCount={post.karmaCount}
             myKarma={post.myKarma} karmaCof={post.fandom.karmaCof} />
    </div>
  </article>;
}
