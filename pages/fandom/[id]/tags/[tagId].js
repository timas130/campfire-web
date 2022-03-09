import {fetchTag} from "../../../api/fandom/tags/[tagId]";
import {fetchTagPosts} from "../../../api/fandom/tags/[tagId]/posts";
import {useInfScroll} from "../../../../lib/client-api";
import FeedLayout, {FeedLoader} from "../../../../components/FeedLayout";
import Post from "../../../../components/publication/post/Post";
import TagCard from "../../../../components/cards/TagCard";
import Head from "next/head";
import MetaTags from "../../../../components/MetaTags";
import {handleSSRError, mustInt} from "../../../../lib/api";

export default function Tag({tag, posts}) {
  const {data: postPages, ref, showLoader} = useInfScroll(
    `/api/fandom/tags/${tag.id}/posts`,
    false, 20, [posts],
  );

  const title = `${tag.jsonDB.J_NAME} | ${tag.fandom.name} | Campfire`;
  return <>
    <Head>
      <title>{title}</title>
      <MetaTags
        url={`https://campfire.moe/fandom/${tag.fandom.id}/tags/${tag.id}`}
        title={title}
      />
    </Head>
    <FeedLayout
      list={<>
        {postPages && postPages.map(page => page.map(post => <Post post={post} key={post.id} showBestComment />))}
        {showLoader && <FeedLoader ref={ref} />}
      </>}
      staticSidebar={<TagCard tag={tag} />}
    />
  </>;
}

export async function getServerSideProps(ctx) {
  try {
    return {
      props: {
        tag: await fetchTag(ctx.req, ctx.res, mustInt(ctx.query.tagId)),
        posts: await fetchTagPosts(ctx.req, ctx.res, mustInt(ctx.query.tagId)),
      },
    };
  } catch (e) {
    return handleSSRError(e, ctx.res);
  }
}
