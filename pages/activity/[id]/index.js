import {useRouter} from "next/router";
import {useInfScroll} from "../../../lib/client-api";
import {fetchActivityPosts} from "../../api/activity/[id]/posts";
import FeedLayout, {FeedLoader} from "../../../components/FeedLayout";
import UserActivityPage from "../../../components/publication/post/pages/UserActivityPage";
import {fetchActivity} from "../../api/activity/[id]";
import Post from "../../../components/publication/post/Post";

export default function Activity({activity, posts}) {
  const id = useRouter().query.id;
  const {data: postPages, ref, showLoader} = useInfScroll(
    `/api/activity/${id}/posts`,
    false, 10,
    [posts]
  );

  return <FeedLayout
    list={<>
      <UserActivityPage page={activity} full />
      {postPages.map(page => page.map(post => <Post key={post.id} post={post} showBestComment />))}
      {showLoader && <FeedLoader ref={ref} />}
    </>}
  />;
}

export async function getServerSideProps(ctx) {
  return {
    props: {
      activity: await fetchActivity(ctx.req, ctx.res, ctx.query.id),
      posts: await fetchActivityPosts(ctx.req, ctx.res, ctx.query.id),
    },
  };
}
