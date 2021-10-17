import {fetchProfile} from "../../api/account/[id]";
import FeedLayout, {FeedLoader} from "../../../components/FeedLayout";
import ProfileCard from "../../../components/profile/ProfileCard";
import Head from "next/head";
import Post from "../../../components/publication/post/Post";
import {useInfScroll} from "../../../lib/client-api";
import Comment from "../../../components/publication/Comment";

export default function Profile({account, profile}) {
  const {data: pubPages, ref, showLoader} = useInfScroll(
    `/api/account/${account.J_ID}/publications`
  );

  return <>
    <Head>
      <title>Профиль {account.J_NAME} | Campfire</title>
    </Head>
    <FeedLayout
      list={<>
        <ProfileCard account={account} profile={profile} />

        {profile.pinnedPost && <Post post={profile.pinnedPost} pinned />}
        {pubPages && pubPages.map(page => page.map(pub => (
          pub.unitType === 1 ?
            <Comment full key={pub.id} comment={pub} /> :
            <Post key={pub.id} post={pub} />
        )))}
        {showLoader && <FeedLoader ref={ref} />}
      </>}
    />
  </>;
}

export async function getServerSideProps(ctx) {
  return {
    props: await fetchProfile(ctx.req, ctx.res, ctx.query.id),
  };
}
