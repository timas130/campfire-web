import Layout from "../components/Layout";
import Head from "next/head";
import FeedLayout, {FeedLoader} from "../components/FeedLayout";
import Post from "../components/publication/Post";
import {fetchFeed} from "./api/feed";
import {fetchFandoms} from "./api/fandoms";
import PopularFandomsCard from "../components/cards/PopularFandomsCard";
import InfiniteScroll from "react-infinite-scroller";
import {useState} from "react";

export default function Home({feed, fandoms}) {
  const [posts, setPosts] = useState(feed);
  return <Layout dark>
    <Head>
      <title>Лента | Campfire</title>
    </Head>
    {feed && <FeedLayout list={
      <InfiniteScroll
        pageStart={0}
        loadMore={async () => {
          const resp = (await (await fetch("/api/feed?offset=" + posts[posts.length - 1].dateCreate)).json()).units;
          setPosts(posts => posts.concat(resp));
        }}
        hasMore={true}
        loader={<FeedLoader />}
      >
        {posts.map(post => <Post key={post.id} post={post} />)}
      </InfiniteScroll>
    } sidebar={<>
      <PopularFandomsCard fandoms={fandoms} />
    </>} />}
  </Layout>;
}

// s/o 2450954#2450976
function shuffle(array) {
  let currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

export async function getServerSideProps(ctx) {
  return {
    props: {
      feed: (await fetchFeed(ctx.req, ctx.res)).units,
      fandoms: shuffle(await fetchFandoms(ctx.req, ctx.res)),
    },
  };
}
