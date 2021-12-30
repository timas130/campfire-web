import classes from "../../../styles/Post.module.css";
import Link from "next/link";
import moment from "moment";
import "moment/locale/ru";
import classNames from "classnames";
import {ChatAlt2Icon, DotsVerticalIcon, PencilIcon} from "@heroicons/react/solid";
import Karma from "../../Karma";
import {useMemo, useRef, useState} from "react";
import ShareButton from "../../ShareButton";
import {useRouter} from "next/router";
import Pages from "./pages/Pages";
import Comment from "../Comment";
import UserActivityPage from "./pages/UserActivityPage";
import ExpandButton from "../../ExpandButton";
import FandomHeader from "../../FandomHeader";
import Dropdown from "../../Dropdown";
import copy from "copy-to-clipboard";

function CommentCounter(props) {
  return <Link href={props.href}>
    <a className={classes.commentCounter} target="_blank">
      <ChatAlt2Icon className={classes.commentIcon} />
      {props.count}
    </a>
  </Link>;
}

export default function Post(props) {
  const {post: postL, alwaysExpanded, showBestComment, pinned, draft} = props;
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
    <FandomHeader
      pinned={pinned} fandom={post.fandom} addTitle={<>
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
      </>}
      author={post.creator.J_NAME} authorLink={`/account/${encodeURIComponent(post.creator.J_NAME)}`}
      addSecondary={<time dateTime={moment(post.dateCreate).toISOString()}>
        {moment(post.dateCreate).locale("ru").fromNow()}
      </time>}
      addRight={<Dropdown items={[
        {
          id: "share", label: "Копировать ссылку",
          onClick: () => copy(`https://camp.33rd.dev/post/${post.id}`),
        },
      ]}>
        <DotsVerticalIcon className={classes.headerMore} />
      </Dropdown>}
    />
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
      {!draft ? <>
        <ShareButton link={router.basePath + `/post/${post.id}`} />
        <CommentCounter href={`/post/${post.id}#comments`} count={post.subUnitsCount} />
      </> : <Link href={`/drafts/${post.id}`}>
        <a className={classes.editButton}>
          <PencilIcon className={classes.editIcon} />
          Редактировать
        </a>
      </Link>}
      {!draft && <Karma pub={post} />}
    </div>
    {showBestComment && post.bestComment && <Comment bestComment comment={post.bestComment} />}
  </article>;
}
