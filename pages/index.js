import Head from "next/head";
import FeedLayout, {FeedLoader} from "../components/FeedLayout";
import Post from "../components/publication/post/Post";
import PopularFandomsCard from "../components/cards/PopularFandomsCard";
import AuthenticateCard from "../components/cards/AuthenticateCard";
import DonateCard from "../components/cards/DonateCard";
import {useInfScroll, useSWRUser} from "../lib/client-api";
import DailyQuestCard from "../components/cards/DailyQuestCard";
import MetaTags from "../components/MetaTags";
import {useState} from "react";
import FeedTypeSelectorCard from "../components/cards/FeedTypeSelectorCard";
import PostPlaceholder from "../components/publication/post/PostPlaceholder";

export default function Home() {
  const [type, setType] = useState("subscribed");
  const {error: userError} = useSWRUser();

  const resolvedType = type === "subscribed" ? userError ? "all" : type : type;
  const {data: feed, ref, showLoader} = useInfScroll(
    `/api/feed?type=${resolvedType}`, true
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
        url="https://campfire.moe"
      />
    </Head>
    <FeedLayout list={<>
      <FeedTypeSelectorCard type={resolvedType} setType={setType} />
      {feed && feed.map(feedPage => feedPage.units.map(post => <Post key={post.id} post={post} showBestComment />))}
      {showLoader && <PostPlaceholder ref={ref} />}
      {showLoader ?
        Array(feed.length === 0 ? 19 : 0).fill(null)
          .map((_v, i) => <PostPlaceholder key={i} />) :
        <FeedLoader text="Конец ленты" />
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
