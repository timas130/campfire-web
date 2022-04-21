import classes from "../../../styles/Post.module.css";
import Link from "next/link";
import dayjs from "../../../lib/time";
import classNames from "classnames";
import {ArrowsExpandIcon, ChatAlt2Icon, DotsVerticalIcon, PencilIcon, XIcon} from "@heroicons/react/solid";
import Karma, {KarmaCounter} from "../../Karma";
import React, {useEffect, useMemo, useRef, useState} from "react";
import ShareButton from "../../controls/ShareButton";
import {useRouter} from "next/router";
import Pages from "./pages/Pages";
import Comment from "../comment/Comment";
import UserActivityPage from "./pages/UserActivityPage";
import FandomHeader from "../../FandomHeader";
import Dropdown from "../../controls/Dropdown";
import copy from "copy-to-clipboard";
import {ModalPortal} from "../../Modal";
import {useTheme} from "../../../lib/theme";
import layoutClasses from "../../../styles/Layout.module.css";
import useSWR from "swr";
import {FeedLoader} from "../../FeedLayout";
import Tags from "./Tags";
import Tooltip from "../../Tooltip";
import Comments from "../comment/Comments";
import {useModalState} from "../../../lib/ui";
import KarmaVotesModel from "./KarmaVotesModal";
import {PostModerationProvider, usePostModerationEntries} from "../../moderation/PostModeration";

export function CommentCounter({target = "_blank", ...props}) {
  const link = <a className={classes.commentCounter} target={target} onClick={props.onClick}>
    <ChatAlt2Icon className={classes.commentIcon} />
    {props.count}
  </a>;
  return props.onClick ? link : <Link href={props.href}>
    {link}
  </Link>;
}

function PostCover({theme, post, hide}) {
  const {data} = useSWR(`/api/post/${post.id}`);
  const scrollRef = useRef();

  return <div className={classNames(
    classes.postCover,
    theme === "dark" && layoutClasses.dark,
    layoutClasses.light
  )} onClick={hide} autoFocus ref={scrollRef}><div
    className={classes.postCoverClick}
    onClick={ev => ev.stopPropagation()}
  >
    <div className={classes.coverClose} onClick={hide} tabIndex={0}>
      Закрыть
      <XIcon />
    </div>
    <_Post post={post} alwaysExpanded collapse={hide} />
    {data ? <>
      {data.tags.length > 0 && <div className={classes.coverTagsOuter}>
        <Tags tags={data.tags} className={classes.coverTags} />
      </div>}
      <div className={classes.coverComments}>
        <Comments totalComments={post.subUnitsCount} unitId={post.id} element
                  scrollElement={scrollRef.current} />
      </div>
    </> : <FeedLoader />}
  </div></div>;
}

function _Post(props) {
  const {post: postL, alwaysExpanded, showBestComment, pinned, draft, main = false, collapse} = props;
  const router = useRouter();
  const {theme} = useTheme();
  const contentRef = useRef();
  const [modalShown, setModalShown] = useState(false);
  const [showGradient, setShowGradient] = useState(true);

  const karmaModal = useModalState();

  const {data: {rubric} = {}} = useSWR(postL.rubricId && `/api/rubric/${postL.rubricId}?offset=-1`);
  const rubricCof = rubric ? rubric.karmaCof : 0;

  const hideModal = () => {
    setModalShown(false);
  };
  const showModal = () => {
    setModalShown(true);
  };

  useEffect(() => {
    if (!contentRef.current) return;
    const content = contentRef.current;
    let cnt = 0;
    let interval;
    interval = setInterval(() => {
      const h = content.getBoundingClientRect().height;
      setShowGradient(h >= 510);
      if (++cnt >= 3 || h >= 512) clearInterval(interval);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const post = useMemo(() => {
    if (typeof postL.jsonDB !== "object") {
      postL.jsonDB = JSON.parse(postL.jsonDB);
    }
    if (typeof postL.jsonDB.J_PAGES !== "object") {
      postL.jsonDB.J_PAGES = JSON.parse(postL.jsonDB.J_PAGES);
    }
    return postL;
  }, [postL]);

  const ContentEl = main ? "div" : "div";

  const pagesAdditional = useMemo(() => ({postId: post.id}), [post]);

  return <article className={classes.post}>
    <KarmaVotesModel id={post.id} close={karmaModal.close} isOpen={karmaModal.isOpen} />
    {modalShown && <ModalPortal>
      {/* TODO: one day i'll be able to make a fancy animation for expanding the post... */}
      <PostCover theme={theme} post={post} hide={hideModal} />
    </ModalPortal>}

    <FandomHeader
      el="header"
      pinned={pinned}
      fandom={post.fandom}
      addTitle={<>
        {post.rubricId !== 0 && <>&nbsp;<Link href={`/rubric/${post.rubricId}`}>
          <a className={classNames(classes.headerRubric)}>
            в {post.rubricName} {rubricCof > 100 && <Tooltip text="Коэффициент кармы у рубрики">
              <KarmaCounter isCof value={rubricCof} />
            </Tooltip>}
          </a>
        </Link></>}
        {post.userActivity && <>&nbsp;<Link href={`/activity/${post.userActivity.id}`}>
          <a className={classNames(classes.headerRubric)}>
            в {post.userActivity.name}
          </a>
        </Link></>}
      </>}
      author={post.creator.J_NAME}
      authorLink={`/account/${encodeURIComponent(post.creator.J_NAME)}`}
      addSecondary={<time dateTime={dayjs(post.dateCreate).format()}>
        {dayjs(post.dateCreate).locale("ru").fromNow()}
      </time>}
      addRight={<Dropdown items={[
        {
          id: "share", label: "Копировать ссылку",
          onClick: () => copy(`https://campfire.moe/post/${post.id}`),
        },
        {
          id: "karma", label: "Посмотреть карму",
          onClick: karmaModal.open,
        },
        ...usePostModerationEntries({post}),
      ]}>
        <DotsVerticalIcon className={classes.headerMore} />
      </Dropdown>}
    />
    <ContentEl className={classNames(
      classes.content,
      (alwaysExpanded || !showGradient) && classes.expanded
    )} ref={contentRef}>
      <Pages pages={post.jsonDB.J_PAGES} additional={pagesAdditional} />
      {post.userActivity && <UserActivityPage page={post.userActivity} />}
    </ContentEl>
    <div className={classes.footer}>
      {!draft && !alwaysExpanded && <div className={classes.expander} onClick={showModal} tabIndex={0}>
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
        <CommentCounter href={`/post/${post.id}#comments`} count={post.subUnitsCount}
                        onClick={!alwaysExpanded && showModal} />
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

export default React.memo(function Post(props) {
  return <PostModerationProvider pub={props.post}>
    <_Post {...props} />
  </PostModerationProvider>;
});
