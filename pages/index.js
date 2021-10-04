import Layout from "../components/Layout";
import Head from "next/head";
import FeedLayout, {FeedLoader} from "../components/FeedLayout";
import Post from "../components/publication/Post";
import PopularFandomsCard from "../components/cards/PopularFandomsCard";
import AuthenticateCard from "../components/cards/AuthenticateCard";
import useSWRInfinite from "swr/infinite";
import {fetcher} from "./_app";
import {useInView} from "react-intersection-observer";
import {useEffect} from "react";

export default function Home() {
  const { data: feed, size, setSize } = useSWRInfinite((pageIndex, previousPageData) => {
    if (! previousPageData) return "/api/feed";
    else return "/api/feed?offset=" + previousPageData.units[previousPageData.units.length - 1].dateCreate;
  }, fetcher);
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
      <title>Лента | Campfire</title>
    </Head>
    <FeedLayout list={<>
      {feed && feed.map(feedPage => feedPage.units.map(post => <Post key={post.id} post={post} />))}
      {<FeedLoader ref={ref} />}
    </>} sidebar={<>
      <PopularFandomsCard />
      <AuthenticateCard />
    </>} />
  </Layout>;
}
