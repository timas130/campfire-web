import classes from "../../../styles/Post.module.css";
import Link from "next/link";
import dayjs from "../../../lib/time";
import classNames from "classnames";
import {ArrowsExpandIcon, ChatAlt2Icon, DotsVerticalIcon, PencilIcon, XIcon} from "@heroicons/react/solid";
import Karma, {KarmaCounter} from "../../Karma";
import React, {Fragment, useEffect, useMemo, useRef, useState} from "react";
import ShareButton from "../../controls/ShareButton";
import {useRouter} from "next/router";
import Pages from "./pages/Pages";
import Comment from "../comment/Comment";
import UserActivityPage from "./pages/UserActivityPage";
import FandomHeader, {SponsorStar} from "../../FandomHeader";
import {Dropdown, DropdownItem, DropdownSection} from "../../controls/Dropdown";
import copy from "copy-to-clipboard";
import {ModalPortal} from "../../Modal";
import {useTheme} from "../../../lib/theme";
import layoutClasses from "../../../styles/Layout.module.css";
import useSWR from "swr";
import {FeedLoader} from "../../FeedLayout";
import Tags from "./Tags";
import Tooltip from "../../Tooltip";
import Comments from "../comment/Comments";
import {showButtonToast, showErrorToast, useModalState} from "../../../lib/ui";
import KarmaVotesModel from "../KarmaVotesModal";
import {PostModerationEntries, PostModerationProvider} from "../../moderation/PostModeration";
import {fetcher} from "../../../lib/client-api";
import {FocusTrap, Transition} from "@headlessui/react";

export function CommentCounter({target = "_blank", ...props}) {
  const link = <a className={classes.commentCounter} target={target} onClick={props.onClick}>
    <ChatAlt2Icon className={classes.commentIcon} />
    {props.count}
  </a>;
  return props.onClick ? link : <Link href={props.href} legacyBehavior>
    {link}
  </Link>;
}

function PostCover({theme, post, hide}) {
  const {data} = useSWR(`/api/post/${post.id}`);
  const scrollRef = useRef();

  return <FocusTrap><div className={classNames(
    classes.postCover,
    theme === "dark" && layoutClasses.dark,
    layoutClasses.light
  )} onClick={hide} autoFocus ref={scrollRef}><div
    className={classes.postCoverClick}
    onClick={ev => ev.stopPropagation()}
    onKeyDown={ev => ev.key === "Escape" && hide()}
    tabIndex={0}
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
  </div></div></FocusTrap>;
}

function _Post(props) {
  const {post: postL, alwaysExpanded, showBestComment, pinned, draft, main = false, collapse, mutate} = props;
  const router = useRouter();
  const {theme} = useTheme();
  const contentRef = useRef();
  const [modalShown, setModalShown] = useState(false);
  const [showGradient, setShowGradient] = useState(true);
  const [isDeleted, setIsDeleted] = useState(false);

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
    if (typeof postL.jsonDB === "string") {
      postL.jsonDB = JSON.parse(postL.jsonDB);
    }
    if (typeof postL.jsonDB.J_PAGES === "string") {
      postL.jsonDB.J_PAGES = JSON.parse(postL.jsonDB.J_PAGES);
    }
    return postL;
  }, [postL]);

  const ContentEl = main ? "div" : "div";

  const pagesAdditional = useMemo(() => ({postId: post.id}), [post]);

  return (
    <Transition as={Fragment} show={!isDeleted}
                       leave={classes.transitionLeave}
                       leaveFrom={classes.transitionLeaveFrom}
                       leaveTo={classes.transitionLeaveTo}><article className={classes.post}>
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
          {post.rubricId !== 0 && <>&nbsp;<Link
            href={`/rubric/${post.rubricId}`}
            className={classNames(classes.headerRubric)}>
            в{post.rubricName} {rubricCof > 100 && <Tooltip text="Коэффициент кармы у рубрики">
                <KarmaCounter isCof value={rubricCof} />
              </Tooltip>}

          </Link></>}
          {post.userActivity && <>&nbsp;<Link
            href={`/activity/${post.userActivity.id}`}
            className={classNames(classes.headerRubric)}>
            в{post.userActivity.name}

          </Link></>}
        </>}
        author={<>{post.creator.J_NAME}<SponsorStar account={post.creator} /></>}
        authorLink={`/account/${encodeURIComponent(post.creator.J_NAME)}`}
        addSecondary={<time dateTime={dayjs(post.dateCreate).format()}>
          {dayjs(post.dateCreate).locale("ru").fromNow()}
        </time>}
        addRight={<Dropdown
          activator={<DotsVerticalIcon />}
          activatorClassName={classes.headerMore}
        >
          {draft && <DropdownSection>
            <DropdownItem onClick={ev => {
              fetcher(`/api/drafts/${postL.id}/delete`, {method: "POST"})
                .then(() => setIsDeleted(true))
                .then(() => mutate())
                .catch(err => showErrorToast(ev.target, err));
            }}>
              Удалить
            </DropdownItem>
          </DropdownSection>}
          {!draft && <DropdownSection>
            <DropdownItem onClick={ev => {
              copy(`https://campfire.moe/post/${post.id}`);
              showButtonToast(ev.target, "Скопировано");
            }}>
              Копировать ссылку
            </DropdownItem>
            <DropdownItem onClick={karmaModal.open}>
              Посмотреть оценки
            </DropdownItem>
          </DropdownSection>}
          {!draft && <PostModerationEntries />}
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
        </> : <Link href={`/drafts/${post.id}`} className={classes.editButton}>

          <PencilIcon className={classes.editIcon} />Редактировать
        </Link>}
        {!draft && <Karma pub={post} />}
      </div>
      {showBestComment && post.bestComment && <Comment bestComment comment={post.bestComment} />}
    </article></Transition>
  );
}

export default function Post(props) {
  return <PostModerationProvider pub={props.post}>
    <_Post {...props} />
  </PostModerationProvider>;
};
