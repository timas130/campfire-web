import Layout from "../components/Layout";
import Head from "next/head";
import FeedLayout from "../components/FeedLayout";
import Post from "../components/publication/Post";
import {fetchFeed} from "./api/feed";

export default function Home({feed}) {
  return <Layout dark>
    <Head>
      <title>Лента | Campfire</title>
    </Head>
    {feed && <FeedLayout list={
      feed.map(post => <Post key={post.id} post={post} />)
    } />}
  </Layout>;
}

export async function getServerSideProps(ctx) {
  return {
    props: {
      feed: (await fetchFeed(ctx.req, ctx.res)).units
    }
  };
}
