import {fetchFandom} from "../../api/fandom/[id]";
import FeedLayout, {FeedLoader} from "../../../components/FeedLayout";
import FandomCard from "../../../components/cards/FandomCard";
import Head from "next/head";
import Post from "../../../components/publication/post/Post";
import {useInfScroll} from "../../../lib/client-api";
import MetaTags from "../../../components/MetaTags";
import {handleSSRError, mustInt} from "../../../lib/api";

export default function Fandom({ fandom, profile, info }) {
  const {data: postPages, ref, showLoader} = useInfScroll(
    `/api/fandom/${fandom.id}/posts`
  );

  const title = `Фэндом ${fandom.name} | Campfire`;
  return <>
    <Head>
      <title>{title}</title>
      <MetaTags title={title} url={`https://camp.33rd.dev/fandom/${fandom.id}`} />
    </Head>
    <FeedLayout
      list={<>
        {profile.pinnedPost && <Post post={profile.pinnedPost} pinned />}
        {postPages && postPages.map(page => (
          page.map(post => <Post key={post.id} post={post} />)
        ))}
        {showLoader && <FeedLoader ref={ref} />}
      </>}
      staticSidebar={
        <FandomCard fandom={fandom} profile={profile} info={info} />
      }
    />
  </>;
}

export async function getServerSideProps(ctx) {
  try {
    return {
      props: {
        ...(await fetchFandom(ctx.req, ctx.res, mustInt(ctx.query.id))),
      },
    };
  } catch (e) {
    return handleSSRError(e, ctx.res);
  }
}
