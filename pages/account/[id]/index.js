import {fetchProfile} from "../../api/account/[id]";
import FeedLayout, {FeedLoader} from "../../../components/FeedLayout";
import ProfileCard from "../../../components/profile/ProfileCard";
import Head from "next/head";
import Post from "../../../components/publication/post/Post";
import {useInfScroll} from "../../../lib/client-api";
import Comment from "../../../components/publication/Comment";
import postClasses from "../../../styles/Post.module.css";
import FormattedText from "../../../components/FormattedText";
import MetaTags from "../../../components/MetaTags";
import {handleSSRError} from "../../../lib/api";
import useSWR from "swr";

export default function Profile({account: initialAccount, profile: initialProfile}) {
  const {data: {account, profile}} = useSWR(
    `/api/account/${initialAccount.J_ID}`,
    {
      fallbackData: {account: initialAccount, profile: initialProfile},
      revalidateOnFocus: false,
    },
  );
  const {data: pubPages, ref, showLoader} = useInfScroll(
    `/api/account/${account.J_ID}/publications`
  );

  const title = `Профиль ${account.J_NAME} | Campfire`;
  return <>
    <Head>
      <title>{title}</title>
      <MetaTags title={title} url={`https://camp.33rd.dev/account/${encodeURIComponent(account.J_NAME)}`} />
    </Head>
    <FeedLayout
      list={<>
        <ProfileCard account={account} profile={profile} />
        <div className={postClasses.post}>
          {/* lol why not */}
          <div className={postClasses.header}>
            <FormattedText text={profile.description} />
          </div>
        </div>

        {profile.pinnedPost && <Post post={profile.pinnedPost} pinned showBestComment />}
        {pubPages && pubPages.map(page => page.map(pub => (
          pub.unitType === 1 ?
            <Comment full key={pub.id} comment={pub} /> :
            <Post key={pub.id} post={pub} showBestComment />
        )))}
        {showLoader && <FeedLoader ref={ref} />}
      </>}
    />
  </>;
}

export async function getServerSideProps(ctx) {
  try {
    return {
      props: await fetchProfile(ctx.req, ctx.res, ctx.query.id),
    };
  } catch (e) {
    return handleSSRError(e, ctx.res);
  }
}
