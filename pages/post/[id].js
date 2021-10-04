import Layout from "../../components/Layout";
import FeedLayout from "../../components/FeedLayout";
import Post from "../../components/publication/Post";
import {fetchPost} from "../api/post/[id]";
import AuthenticateCard from "../../components/cards/AuthenticateCard";
import Comment from "../../components/publication/Comment";
import {fetchComments} from "../api/post/[id]/comments";
import Head from "next/head";

export default function PostPage(props) {
  return <Layout dark>
    <Head>
      {/* TODO: add partial text content */}
      <title>Пост в {props.post.unit.fandom.name} от {props.post.unit.creator.J_NAME} | Campfire</title>
    </Head>
    <FeedLayout
      list={<>
        <Post post={props.post.unit} alwaysExpanded />
        {props.comments.map(comment => <Comment key={comment.id} comment={comment} />)}
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
