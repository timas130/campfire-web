import FeedLayout, {FeedLoader} from "../../components/FeedLayout";
import Post from "../../components/publication/post/Post";
import {fetchPost} from "../api/post/[id]";
import AuthenticateCard from "../../components/cards/AuthenticateCard";
import Comment from "../../components/publication/Comment";
import {fetchComments} from "../api/post/[id]/comments";
import Head from "next/head";
import {useMemo} from "react";
import CommentPoster from "../../components/CommentPoster";
import FandomCard from "../../components/cards/FandomCard";
import MetaTags from "../../components/MetaTags";
import {useInfScroll} from "../../lib/client-api";
import Tags from "../../components/publication/post/Tags";
import {generateCoverForPages} from "../../lib/text-cover";

export default function PostPage(props) {
  const {data: commentPages, ref, showLoader} = useInfScroll(
    `/api/post/${props.post.unit.id}/comments`,
    true, null, [props.comments]
  );

  const shortDesc = useMemo(
    () => generateCoverForPages(
      typeof props.post.unit.jsonDB.J_PAGES === "string" ?
      JSON.parse(props.post.unit.jsonDB.J_PAGES) :
      props.post.unit.jsonDB.J_PAGES
    ),
    [props.post.unit]
  );
  const title = (shortDesc ? shortDesc + " | " : "")
    + `Пост в ${props.post.unit.fandom.name} от ${props.post.unit.creator.J_NAME} | Campfire`;
  return <>
    <Head>
      {/* TODO: add partial text content */}
      <title>{title}</title>
      <MetaTags
        title={title}
        url={`https://camp.33rd.dev/post/${props.post.unit.id}`}
      />
    </Head>
    <FeedLayout
      list={<>
        <Post post={props.post.unit} alwaysExpanded />
        <Tags tags={props.post.tags} />
        <div id="comments">
          <CommentPoster pubId={props.post.unit.id} />
          {commentPages && commentPages.map(page => page.map(comment => (
            <Comment key={comment.id} comment={comment} />
          )))}
          {showLoader && <FeedLoader ref={ref} />}
        </div>
      </>}
      sidebar={<>
        <FandomCard fetchId={props.post.unit.fandom.id} noLinks />
        <AuthenticateCard />
      </>}
    />
  </>;
}

export async function getServerSideProps(ctx) {
  return {
    props: {
      post: await fetchPost(ctx.req, ctx.res, ctx.query.id),
      comments: await fetchComments(ctx.req, ctx.res, ctx.query.id)
    }
  };
}
