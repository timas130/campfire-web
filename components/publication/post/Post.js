import classes from "../../../styles/Post.module.css";
import Link from "next/link";
import moment from "moment";
import "moment/locale/ru";
import classNames from "classnames";
import {ArrowsExpandIcon, ChatAlt2Icon, DotsVerticalIcon, PencilIcon, XIcon} from "@heroicons/react/solid";
import Karma from "../../Karma";
import {useContext, useMemo, useState} from "react";
import ShareButton from "../../ShareButton";
import {useRouter} from "next/router";
import Pages from "./pages/Pages";
import Comment from "../Comment";
import UserActivityPage from "./pages/UserActivityPage";
import FandomHeader from "../../FandomHeader";
import Dropdown from "../../Dropdown";
import copy from "copy-to-clipboard";
import {ModalPortal} from "../../ModalPortal";
import {ThemeContext} from "../../../lib/theme";
import layoutClasses from "../../../styles/Layout.module.css";
import useSWR from "swr";
import {FeedLoader} from "../../FeedLayout";
import Tags from "./Tags";
import {useInfScroll} from "../../../lib/client-api";

function CommentCounter(props) {
  return <Link href={props.href}>
    <a className={classes.commentCounter} target="_blank">
      <ChatAlt2Icon className={classes.commentIcon} />
      {props.count}
    </a>
  </Link>;
}

function PostCover({theme, post, hide}) {
  const {data: commentPages, ref, showLoader} = useInfScroll(
    `/api/post/${post.id}/comments`, true,
  );
  const {data} = useSWR(`/api/post/${post.id}`);

  const comments = useMemo(() => commentPages.flatMap(a => a), [commentPages]);

  return <div className={classNames(
    classes.postCover,
    theme === "dark" && layoutClasses.dark,
    layoutClasses.light
  )} onClick={hide} autoFocus><div
    className={classes.postCoverClick}
    onClick={ev => ev.stopPropagation()}
  >
    <div className={classes.coverClose} onClick={hide} tabIndex={0}>
      Закрыть
      <XIcon />
    </div>
    <Post post={post} alwaysExpanded collapse={hide} />
    {data ? <>
      {data.tags.length > 0 && <div className={classes.coverTagsOuter}>
        <Tags tags={data.tags} className={classes.coverTags} />
      </div>}
      {comments.length > 0 ? <div className={classes.coverComments}>
        {comments.map(comment => <Comment key={comment.id} comment={comment} />)}
        {showLoader && <FeedLoader ref={ref} />}
      </div> : <div className={classes.coverComments}>
        <FeedLoader text="Нет комментариев" />
      </div>}
    </> : <FeedLoader />}
  </div></div>;
}

export default function Post(props) {
  const {post: postL, alwaysExpanded, showBestComment, pinned, draft, main = false, collapse} = props;
  const router = useRouter();
  const theme = useContext(ThemeContext).theme;
  const [expanded, setExpanded] = useState(false);

  const expand = () => {
    if (window.history) {
      window.history.pushState(null, "", `/post/${postL.id}`);
    }
    setExpanded(true);
  };
  const hideModal = () => {
    window.history.back();
    setExpanded(false);
  };

  const post = useMemo(() => {
    if (typeof postL.jsonDB !== "object") {
      postL.jsonDB = JSON.parse(postL.jsonDB);
    }
    if (typeof postL.jsonDB.J_PAGES !== "object") {
      postL.jsonDB.J_PAGES = JSON.parse(postL.jsonDB.J_PAGES);
    }
    return postL;
  }, [postL]);
  const ContentEl = main ? "main" : "div";
  return <article className={classes.post}>
    {expanded && <ModalPortal>
      {/* TODO: one day i'll be able to make a fancy animation for expanding the post... */}
      <PostCover theme={theme} post={postL} hide={hideModal} />
    </ModalPortal>}
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
    <ContentEl className={classNames(classes.content, alwaysExpanded && classes.expanded)}>
      <Pages pages={post.jsonDB.J_PAGES} />
      {post.userActivity && <UserActivityPage page={post.userActivity} />}
    </ContentEl>
    <div className={classes.footer}>
      {!alwaysExpanded && <div className={classes.expander} onClick={expand} tabIndex={0}>
        <ArrowsExpandIcon className={classes.expandIcon} />
        Развернуть
      </div>}
      {collapse && <div className={classes.expander} onClick={collapse} tabIndex={0}>
        <XIcon className={classes.expandIcon} />
        Закрыть
      </div>}
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
