import {fetchFandom} from "../api/fandom/[id]";
import FeedLayout, {FeedLoader} from "../../components/FeedLayout";
import FandomCard from "../../components/cards/FandomCard";
import Head from "next/head";
import Post from "../../components/publication/post/Post";
import {useInfScroll} from "../../lib/client-api";

export default function Fandom({ fandom, profile, info }) {
  const {data: postPages, ref, showLoader} = useInfScroll(
    `/api/fandom/${fandom.id}/posts`
  );

  return <>
    <Head>
      <title>Фэндом {fandom.name} | Campfire</title>
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
  return {
    props: {
      ...(await fetchFandom(ctx.req, ctx.res, ctx.query.id)),
    },
  };
}
