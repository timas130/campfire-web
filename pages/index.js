import Head from "next/head";
import FeedLayout, {FeedLoader} from "../components/FeedLayout";
import Post from "../components/publication/post/Post";
import PopularFandomsCard from "../components/cards/PopularFandomsCard";
import AuthenticateCard from "../components/cards/AuthenticateCard";
import DonateCard from "../components/cards/DonateCard";
import {useInfScroll} from "../lib/client-api";
import DailyQuestCard from "../components/cards/DailyQuestCard";
import MetaTags from "../components/MetaTags";

export default function Home() {
  const {data: feed, ref, showLoader} = useInfScroll("/api/feed", true);

  return <>
    <Head>
      <title>Лента | Campfire</title>
      <MetaTags
        title={"Campfire"}
        description={
          "Campfire — это уютное место с сообществами и " +
          "фэндомами на самые разные темы. Заходите на огонёк!"
        }
      />
    </Head>
    <FeedLayout list={<>
      {feed && feed.map(feedPage => feedPage.units.map(post => <Post key={post.id} post={post} showBestComment />))}
      {showLoader && <FeedLoader ref={ref} />}
    </>} sidebar={<>
      <PopularFandomsCard />
      <AuthenticateCard />
      <DailyQuestCard />
      <DonateCard />
    </>} />
  </>;
}
