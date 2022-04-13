import {useRouter} from "next/router";
import {useInfScroll} from "../../../lib/client-api";
import {fetchActivityPosts} from "../../api/activity/[id]/posts";
import FeedLayout, {FeedLoader} from "../../../components/FeedLayout";
import UserActivityPage from "../../../components/publication/post/pages/UserActivityPage";
import {fetchActivity} from "../../api/activity/[id]";
import Post from "../../../components/publication/post/Post";
import {handleSSRError, mustInt} from "../../../lib/api";
import Head from "next/head";
import MetaTags from "../../../components/MetaTags";

export default function Activity({activity, posts}) {
  const id = useRouter().query.id;
  const {data: postPages, ref, showLoader} = useInfScroll(
    `/api/activity/${id}/posts`,
    false, 10,
    [posts]
  );

  const title = `Эстафета ${activity.name} в Campfire`;
  return <FeedLayout
    list={<>
      <Head>
        <title>{title}</title>
        <MetaTags
          title={title} description={activity.description}
          url={`https://campfire.moe/activity/${activity.id}`}
          image={`https://campfire.moe/api/image/${activity.fandom.imageId}`}
        />
      </Head>
      <UserActivityPage page={activity} full />
      {postPages.map(page => page.map(post => <Post key={post.id} post={post} showBestComment />))}
      {showLoader && <FeedLoader ref={ref} />}
    </>}
  />;
}

export async function getServerSideProps(ctx) {
  try {
    return {
      props: {
        activity: await fetchActivity(ctx.req, ctx.res, mustInt(ctx.query.id)),
        posts: await fetchActivityPosts(ctx.req, ctx.res, mustInt(ctx.query.id)),
      },
    };
  } catch (e) {
    return handleSSRError(e, ctx.res);
  }
}
