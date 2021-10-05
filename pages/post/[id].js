import Layout from "../../components/Layout";
import FeedLayout, {FeedLoader} from "../../components/FeedLayout";
import Post from "../../components/publication/Post";
import {fetchPost} from "../api/post/[id]";
import AuthenticateCard from "../../components/cards/AuthenticateCard";
import Comment from "../../components/publication/Comment";
import {fetchComments} from "../api/post/[id]/comments";
import Head from "next/head";
import useSWRInfinite from "swr/infinite";
import {fetcher} from "../_app";
import {useInView} from "react-intersection-observer";
import {useEffect} from "react";

export default function PostPage(props) {
  const commentsApiLink = "/api/post/" + props.post.unit.id + "/comments";
  const { data: commentPages, size, setSize } = useSWRInfinite(
    (pageIndex, previousPageData) => {
      if (! previousPageData) return commentsApiLink;
      else if (previousPageData.length === 0) return null;
      else return commentsApiLink + "?offset=" + previousPageData[previousPageData.length - 1].dateCreate;
    }, fetcher, {
      fallbackData: [props.comments],
      revalidateOnFocus: false,
      revalidateIfStale: false,
      // when loading more pages, swr makes two requests: for
      // the first page, and for the next page. apparently this
      // is intentional, but would be nice if it could be disabled.
      //
      // see https://github.com/vercel/swr/issues/1401, maybe open a pr?
    }
  );
  const { ref, inView } = useInView({
    initialInView: false
  });

  useEffect(() => {
    if (inView) {
      // noinspection JSIgnoredPromiseFromCall
      setSize(size + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return <Layout dark>
    <Head>
      {/* TODO: add partial text content */}
      <title>Пост в {props.post.unit.fandom.name} от {props.post.unit.creator.J_NAME} | Campfire</title>
    </Head>
    <FeedLayout
      list={<>
        <Post post={props.post.unit} alwaysExpanded />
        {commentPages && commentPages.map(page => {
          return page.map(comment => {
            return <Comment key={comment.id} comment={comment} />;
          });
        })}
        {(commentPages.length === 0 || commentPages[commentPages.length - 1].length !== 0) && <FeedLoader ref={ref} />}
      </>}
      sidebar={<>
        <AuthenticateCard />
      </>}
    />
  </Layout>;
}

export async function getServerSideProps(ctx) {
  return {
    props: {
      post: await fetchPost(ctx.req, ctx.res, ctx.query.id),
      comments: await fetchComments(ctx.req, ctx.res, ctx.query.id)
    }
  };
}
