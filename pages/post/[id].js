import Layout from "../../components/Layout";
import FeedLayout from "../../components/FeedLayout";
import Post from "../../components/publication/Post";
import {fetchPost} from "../api/post/[id]";

export default function PostPage(props) {
  return <Layout dark>
    <FeedLayout
      list={<Post post={props.post.unit} alwaysExpanded />}
    />
  </Layout>;
}

export async function getServerSideProps(ctx) {
  return {
    props: {
      post: await fetchPost(ctx.req, ctx.res, ctx.query.id)
    }
  };
}
