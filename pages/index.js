import Head from "next/head";
import FeedLayout, {FeedLoader} from "../components/FeedLayout";
import Post from "../components/publication/post/Post";
import PopularFandomsCard from "../components/cards/PopularFandomsCard";
import AuthenticateCard from "../components/cards/AuthenticateCard";
import DonateCard from "../components/cards/DonateCard";
import {useInfScroll} from "../lib/client-api";
import DailyQuestCard from "../components/cards/DailyQuestCard";
import MetaTags from "../components/MetaTags";
import {useState} from "react";
import FeedTypeSelectorCard from "../components/cards/FeedTypeSelectorCard";
import PostPlaceholder from "../components/publication/post/PostPlaceholder";

export default function Home() {
  const [type, setType] = useState("subscribed");
  const {data: feed, ref, showLoader} = useInfScroll(
    `/api/feed?type=${type}`, true
  );

  return <>
    <Head>
      <title>Campfire &mdash; сообщества и фэндомы</title>
      <MetaTags
        title={"Campfire — сообщества и фэндомы"}
        description={
          "Campfire — это уютное место с сообществами и " +
          "фэндомами на самые разные темы. Заходите на огонёк!"
        }
        url="https://camp.33rd.dev"
      />
    </Head>
    <FeedLayout list={<>
      <FeedTypeSelectorCard type={type} setType={setType} />
      {feed && feed.map(feedPage => feedPage.units.map(post => <Post key={post.id} post={post} showBestComment />))}
      {showLoader ?
        Array(feed.length === 0 ? 20 : 1).fill(null)
          .map((_v, i) => <PostPlaceholder key={i} ref={ref} />) :
        <FeedLoader text={
          type === "subscribed" ?
            "Подпишитесь на фэндом, чтобы тут появились посты" :
            "Конец"
        } />
      }
      {/* TODO: subscribe button in PopularFandomsCard */}
      {!showLoader && type === "subscribed" && <PopularFandomsCard limit={15} shuffle={false} />}
    </>} sidebar={<>
      <PopularFandomsCard />
      <AuthenticateCard />
      <DailyQuestCard />
      <DonateCard />
    </>} />
  </>;
}
