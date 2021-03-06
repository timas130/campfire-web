import Head from "next/head";
import {fetchRubric} from "../api/rubric/[id]";
import MetaTags from "../../components/MetaTags";
import FeedLayout, {FeedLoader} from "../../components/FeedLayout";
import {useInfScroll} from "../../lib/client-api";
import Post from "../../components/publication/post/Post";
import RubricCard from "../../components/cards/RubricCard";
import {handleSSRError, mustInt} from "../../lib/api";

export default function Rubric({rubric, posts}) {
  const {data: postPages, ref, showLoader} = useInfScroll(
    `/api/rubric/${rubric.id}`, false,
    20, [{posts}]
  );
  const title = `Рубрика "${rubric.name}" в ${rubric.fandom.name} в Campfire`;
  return <>
    <Head>
      <title>{title}</title>
      <MetaTags
        title={title} url={`https://campfire.moe/rubric/${rubric.id}`}
      />
    </Head>
    <FeedLayout
      list={<>
        {postPages.map(page => page.posts.map(post => <Post key={post.id} post={post} showBestComment />))}
        {showLoader && <FeedLoader ref={ref} />}
      </>}
      staticSidebar={<RubricCard rubric={rubric} />}
    />
  </>;
}

export async function getServerSideProps(ctx) {
  try {
    return {
      props: {
        ...(await fetchRubric(ctx.req, ctx.res, mustInt(ctx.query.id))),
      },
    };
  } catch (e) {
    return handleSSRError(e, ctx.res);
  }
}
