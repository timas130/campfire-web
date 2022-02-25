import Head from "next/head";
import FeedLayout from "../components/FeedLayout";
import Post from "../components/publication/post/Post";
import PopularFandomsCard from "../components/cards/PopularFandomsCard";
import AuthenticateCard from "../components/cards/AuthenticateCard";
import DonateCard from "../components/cards/DonateCard";
import {useInfScroll} from "../lib/client-api";
import DailyQuestCard from "../components/cards/DailyQuestCard";
import MetaTags from "../components/MetaTags";
import {useRef, useState} from "react";
import FeedTypeSelectorCard from "../components/cards/FeedTypeSelectorCard";
import BigassList from "../components/BigassList";

export default function Home() {
  const [type, setType] = useState("subscribed");
  const {data: feed, loadMore, showLoader} = useInfScroll(
    `/api/feed?type=${type}`, true
  );
  const listRef = useRef(null);

  const feedUnits = feed.flatMap(a => a.units);

  return <>
    <Head>
      <title>Лента | Campfire</title>
      <MetaTags
        title={"Campfire"}
        description={
          "Campfire — это уютное место с сообществами и " +
          "фэндомами на самые разные темы. Заходите на огонёк!"
        }
        url="https://camp.33rd.dev"
      />
    </Head>
    <FeedLayout ref={listRef} list={<>
      <FeedTypeSelectorCard type={type} setType={setType} />
      {/*{feed && feed.map(feedPage => feedPage.units.map(post => <Post key={post.id} post={post} showBestComment />))}*/}
      <BigassList
        list={feedUnits.map(post => <Post key={post.id} post={post} showBestComment />)}
        loadMore={loadMore} parentRef={listRef}
      />
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
