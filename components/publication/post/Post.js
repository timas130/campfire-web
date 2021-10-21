import classes from "../../../styles/Post.module.css";
import {CAvatar} from "../../CImage";
import Link from "next/link";
import moment from "moment";
import "moment/locale/ru";
import classNames from "classnames";
import {ChatAlt2Icon, DotsVerticalIcon} from "@heroicons/react/solid";
import Karma from "../../Karma";
import {useMemo, useRef, useState} from "react";
import ShareButton from "../../ShareButton";
import {useRouter} from "next/router";
import Pages from "./pages/Pages";
import Comment from "../Comment";
import UserActivityPage from "./pages/UserActivityPage";
import ExpandButton from "../../ExpandButton";

function CommentCounter(props) {
  return <Link href={props.href}>
    <a className={classes.commentCounter} target="_blank">
      <ChatAlt2Icon className={classes.commentIcon} />
      {props.count}
    </a>
  </Link>;
}

export default function Post(props) {
  const {post: postL, alwaysExpanded, showBestComment, pinned} = props;
  const router = useRouter();
  const [expanded, setExpanded] = useState(true);
  const contentRef = useRef();

  const post = useMemo(() => {
    if (typeof postL.jsonDB !== "object") {
      postL.jsonDB = JSON.parse(postL.jsonDB);
    }
    if (typeof postL.jsonDB.J_PAGES !== "object") {
      postL.jsonDB.J_PAGES = JSON.parse(postL.jsonDB.J_PAGES);
    }
    return postL;
  }, [postL]);
  return <article className={classes.post}>
    <header className={classNames(classes.header, pinned && classes.pinned)}>
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
          {post.rubricId !== 0 && <>&nbsp;<Link href={`/rubric/${post.rubricId}`}>
            <a className={classNames(classes.headerRubric)}>
              в {post.rubricName}
            </a>
          </Link></>}
          {post.userActivity && <>&nbsp;<Link href={`/activity/${post.userActivity.id}`}>
            <a className={classNames(classes.headerRubric)}>
              в {post.userActivity.name}
            </a>
          </Link></>}
        </div>
        <div className={classes.headerSecondary}>
          <Link href={`/account/${encodeURIComponent(post.creator.J_NAME)}`}>
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
      (alwaysExpanded || expanded) && classes.expanded
    )} ref={contentRef}>
      <Pages pages={post.jsonDB.J_PAGES} />
      {post.userActivity && <UserActivityPage page={post.userActivity} />}
    </div>
    <div className={classes.footer}>
      {!alwaysExpanded && <ExpandButton
        contentRef={contentRef} setExpanded={setExpanded}
        expanded={expanded}
      />}
      <div className={classes.spacer} />
      <ShareButton link={router.basePath + `/post/${post.id}`} />
      <CommentCounter href={`/post/${post.id}#comments`} count={post.subUnitsCount} />
      <Karma pub={post} />
    </div>
    {showBestComment && post.bestComment && <Comment bestComment comment={post.bestComment} />}
  </article>;
}
