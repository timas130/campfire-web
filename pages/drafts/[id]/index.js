import {useRouter} from "next/router";
import FeedLayout, {FeedLoader} from "../../../components/FeedLayout";
import {fetcher, useLocalMutSWR, useRequiredUser, useUser} from "../../../lib/client-api";
import postClasses from "../../../styles/Post.module.css";
import FandomHeader, {FandomHeaderPlaceholder} from "../../../components/FandomHeader";
import classNames from "classnames";
import classes from "../../../styles/Draft.module.css";
import Pages from "../../../components/publication/post/pages/Pages";
import {Page, pageEditTypes} from "../../../components/publication/post/pages/Page";
import {PlusSmIcon} from "@heroicons/react/solid";
import {useState} from "react";
import {pageTypesNames} from "../../../lib/text-cover";
import NoticeCard, {RulesCard, TextFormattingCard} from "../../../components/cards/NoticeCard";
import Link from "next/link";
import Button from "../../../components/controls/Button";
import useSWRImmutable from "swr/immutable";
import Head from "next/head";

// it's better than legacy campweb, but still pretty shitty

function NewPageSelector({where, createPage}) {
  return <div className={classes.newPageSelectorWrapper}>
    <div className={classes.newPageSelector}>
      {Object.keys(pageTypesNames)
        .filter(key => Object.keys(pageEditTypes).includes(key))
        .map(typeIdx => (
          <div
            className={classes.selectorItem} key={typeIdx}
            onClick={() => createPage(where, typeIdx)}
            tabIndex={0}
          >
            {pageTypesNames[typeIdx]}
          </div>
        ))
      }
    </div>
  </div>;
}

const doCreatePage = (at, type = 1, isEditing, setPost, setIsEditing, setShowPageSel) => {
  if (isEditing) return;
  setPost(post => ({
    ...(post || {}),
    jsonDB: {
      ...(post?.jsonDB || {}),
      J_PAGES: [
        ...(post?.jsonDB?.J_PAGES || []).slice(0, at),
        {J_PAGE_TYPE: type, __new: true},
        ...(post?.jsonDB?.J_PAGES || []).slice(at),
      ],
    },
  }));
  setIsEditing(true);
  setShowPageSel(false);
};

function EditablePage({page, idx: pageIdx, children, additional: {setPost, post, isEditing, setIsEditing, onGetId, fandomId}}) {
  const [showPageSel, setShowPageSel] = useState(false);

  const commit = async newPage => {
    if ((!newPage && page.__new) || (newPage && newPage.__delete)) {
      if (newPage && newPage.__delete) { // deleted page
        await fetcher(`/api/drafts/${post.id}/page?action=remove`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({pageIndexes: [pageIdx]}),
        });
        console.timeLog("commit", "deleted page", pageIdx);
      }

      setPost(post => ({
        ...post,
        jsonDB: {
          ...post.jsonDB,
          J_PAGES: post.jsonDB.J_PAGES.filter((page, idx) => idx !== pageIdx),
        },
      }));
      return;
    }

    if (!newPage) return; // not modified

    if (page.__new) {
      // append the page to the end
      const resp = (await fetcher(`/api/drafts/${(post || {}).id || 0}/page?action=put`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fandomId: post?.fandom?.id || fandomId,
          languageId: 2,
          pages: [newPage],
        }),
      }));
      newPage = resp.pages[0];
      console.timeLog("commit", "put page, server page:", newPage);

      if (!post?.id) {
        onGetId(resp.unitId);
        return;
      }

      // move the page if necessary
      if (pageIdx !== post.jsonDB.J_PAGES.length - 1) {
        await fetcher(`/api/drafts/${post.id}/page?action=move`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pageIndex: post.jsonDB.J_PAGES.length - 1,
            targetIndex: pageIdx,
          }),
        });
        console.timeLog("commit", "moved page from", post.jsonDB.J_PAGES.length - 1, "to", pageIdx);
      }

      setPost(post => ({
        ...post,
        jsonDB: {
          ...post.jsonDB,
          J_PAGES: post.jsonDB.J_PAGES.map((page, idx) => {
            if (pageIdx === idx) return newPage;
            else return page;
          }),
        },
      }));
    } else {
      // change the page
      newPage = await fetcher(`/api/drafts/${post.id}/page?action=change`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pageIndex: pageIdx,
          page: newPage,
        }),
      });

      setPost(post => ({
        ...post,
        jsonDB: {
          ...post.jsonDB,
          J_PAGES: post.jsonDB.J_PAGES.map((page, idx) => {
            if (pageIdx === idx) return newPage;
            else return page;
          }),
        },
      }));
    }
  };

  const createPage = (at, type = 1) => {
    doCreatePage(at, type, isEditing, setPost, setIsEditing, setShowPageSel);
  };

  return <>
    {/* children will also use EditablePage */}
    <Page
      page={page} editable commit={commit}
      isEditing={isEditing} setIsEditing={setIsEditing}
    >
      {children}
    </Page>
    <div className={classes.newPageLine}>
      <div className={classes.newPageHover} tabIndex={0} onClick={() => !isEditing && setShowPageSel(x => !x)}>
        <div className={classes.newPageCircle}><PlusSmIcon /></div>
      </div>
    </div>
    {showPageSel && !isEditing && <NewPageSelector where={pageIdx + 1} createPage={createPage} />}
  </>;
}

function MutPost({post, setPost, fandomId, onGetId}) {
  const [isEditing, setIsEditing] = useState(false);
  const [showPageSelTop, setShowPageSelTop] = useState(false);

  const createPage = (at, type) => {
    doCreatePage(at, type, isEditing, setPost, setIsEditing, setShowPageSelTop);
  };

  const user = useUser();
  const {data: fandom} = useSWRImmutable(fandomId && `/api/fandom/${fandomId}`, fetcher);

  return <div className={postClasses.post}>
    {post?.id ? <FandomHeader
      fandom={post.fandom} author={post.creator.J_NAME}
      authorLink={`/account/${encodeURIComponent(post.creator.J_NAME)}`}
    /> : (fandom ? <FandomHeader
      fandom={fandom.fandom} author={user.J_NAME}
      authorLink={`/account/${encodeURIComponent(user.J_NAME)}`}
    /> : <FandomHeaderPlaceholder />)}
    <div className={classNames(postClasses.content, postClasses.expanded, classes.draftContent)}>
      <div className={classes.newPageLine}>
        <div className={classes.newPageHover} tabIndex={0} onClick={() => !isEditing && setShowPageSelTop(x => !x)}>
          <div className={classes.newPageCircle}><PlusSmIcon /></div>
        </div>
      </div>
      {showPageSelTop && !isEditing && <NewPageSelector where={0} createPage={createPage} />}
      <Pages
        pages={post?.jsonDB?.J_PAGES || []}
        additional={{setPost, post, isEditing, setIsEditing, onGetId, fandomId, postId: post?.id}}
        pageEl={EditablePage}
      />
    </div>
  </div>;
}

export default function Draft() {
  const router = useRouter();
  const draftId = parseInt(router.query.id);
  const fandomId = parseInt(router.query.fandom) || 0;

  const user = useRequiredUser();
  const {data: draft, setData: setDraft} = useLocalMutSWR(
    user && draftId && draftId !== 0 && `/api/drafts/${draftId}`
  );

  if (!user) return <FeedLoader />;

  return <FeedLayout
    list={<>
      <Head>
        <title>Черновик | Campfire</title>
      </Head>
      {(draftId && draftId !== 0 && draft) || (draftId === 0) ?
        <MutPost
          post={draft} setPost={setDraft}
          fandomId={fandomId} onGetId={id => {
            router.replace(`/drafts/${id}`);
          }}
        /> :
        <FeedLoader />}
      <Link href={`/drafts/${draftId}/publish`} passHref>
        <Button el="a" secondary>Опубликовать</Button>
      </Link>
    </>}
    sidebar={<>
      <NoticeCard
        title="Черновик"
        content="Все изменения в черновике синхронизируются. Вы можете продолжить когда угодно."
      />
      <TextFormattingCard />
      <RulesCard />
    </>}
  />;
}
