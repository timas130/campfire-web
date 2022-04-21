import {fetchFandom} from "../../api/fandom/[id]";
import FeedLayout, {FeedLoader} from "../../../components/FeedLayout";
import FandomCard from "../../../components/cards/FandomCard";
import Head from "next/head";
import Post from "../../../components/publication/post/Post";
import {useInfScroll} from "../../../lib/client-api";
import MetaTags from "../../../components/MetaTags";
import {handleSSRError, mustInt} from "../../../lib/api";
import {useState} from "react";
import PostFilters, {defaultFandomPostFilters} from "../../../components/publication/post/PostFilters";
import Publication from "../../../components/publication/Publication";

export default function Fandom({ fandom, profile, info }) {
  const [postFilters, setPostFilters] = useState(defaultFandomPostFilters);
  const {data: postPages, ref, showLoader} = useInfScroll(
    `/api/fandom/${fandom.id}/posts?types=${postFilters.unitTypes.join(",")}`
  );

  const title = `Фэндом ${fandom.name} в Campfire`;
  return <>
    <Head>
      <title>{title}</title>
      <MetaTags
        title={title} description={info.description}
        url={`https://campfire.moe/fandom/${fandom.id}`}
        image={`https://campfire.moe/api/image/${fandom.imageId}`}
      />
    </Head>
    <FeedLayout
      list={<>
        <PostFilters options={postFilters} setOptions={setPostFilters} />
        {
          postFilters.unitTypes.includes(9) &&
          profile.pinnedPost &&
          <Post post={profile.pinnedPost} pinned />
        }
        {postPages && postPages.map(page => (
          page.map(pub => <Publication key={pub.id} pub={pub} />)
        ))}
        {showLoader && <FeedLoader ref={ref} />}
      </>}
      staticSidebar={
        <FandomCard fandom={fandom} profile={profile} info={info} />
      }
    />
  </>;
}

export async function getStaticProps(ctx) {
  try {
    return {
      props: {
        ...(await fetchFandom(null, null, mustInt(ctx.params.id))),
      },
      // next.js moment: in js time is represented primarily in milliseconds
      revalidate: 300, // every 5 minutes
    };
  } catch (e) {
    return handleSSRError(e, {}, true);
  }
}

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}
