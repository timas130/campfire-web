import {useRouter} from "next/router";
import FeedLayout, {FeedLoader} from "../../components/FeedLayout";
import {fetcher, useLocalMutSWR} from "../../lib/client-api";
import postClasses from "../../styles/Post.module.css";
import FandomHeader from "../../components/FandomHeader";
import classNames from "classnames";
import classes from "../../styles/Draft.module.css";
import Pages from "../../components/publication/post/pages/Pages";
import {Page} from "../../components/publication/post/pages/Page";
import {PlusSmIcon} from "@heroicons/react/solid";

// it's better than legacy campweb, but still pretty shitty

function makeEditablePage({setPost, post}) {
  return function EditablePage({page, idx: pageIdx, children}) {
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
        newPage = (await fetcher(`/api/drafts/${post.id}/page?action=put`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fandomId: post.fandom.id,
            languageId: 2,
            pages: [newPage],
          }),
        })).pages[0];
        console.timeLog("commit", "put page, server page:", newPage);

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

    const createPage = (at) => {
      setPost(post => ({
        ...post,
        jsonDB: {
          ...post.jsonDB,
          J_PAGES: [
            ...post.jsonDB.J_PAGES.slice(0, at),
            {J_PAGE_TYPE: 1, __new: true},
            ...post.jsonDB.J_PAGES.slice(at),
          ],
        },
      }));
    };

    return <>
      {pageIdx === 0 && <div className={classes.newPageLine}>
        <div className={classes.newPageHover} tabIndex={0} onClick={() => createPage(0)}>
          <div className={classes.newPageCircle}><PlusSmIcon /></div>
        </div>
      </div>}
      {/* children will also use EditablePage */}
      <Page page={page} editable commit={commit}>{children}</Page>
      <div className={classes.newPageLine}>
        <div className={classes.newPageHover} tabIndex={0} onClick={() => createPage(pageIdx + 1)}>
          <div className={classes.newPageCircle}><PlusSmIcon /></div>
        </div>
      </div>
    </>;
  };
}

function MutPost({post, setPost}) {
  return <div className={postClasses.post}>
    <FandomHeader
      fandom={post.fandom} author={post.creator.J_NAME}
      authorLink={`/account/${encodeURIComponent(post.creator.J_NAME)}`}
    />
    <div className={classNames(postClasses.content, postClasses.expanded, classes.draftContent)}>
      <Pages
        pages={post.jsonDB.J_PAGES}
        pageEl={makeEditablePage({setPost, post})}
      />
    </div>
  </div>;
}

export default function Draft() {
  const draftId = useRouter().query.id;
  const {data: draft, setData: setDraft} = useLocalMutSWR(
    draftId && `/api/drafts/${draftId}`
  );

  return <FeedLayout
    list={
      draft ?
        <MutPost post={draft} setPost={setDraft} /> :
        <FeedLoader />
    }
  />;
}
