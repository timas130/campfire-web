import {handleSSRError} from "../../../lib/api";
import {fetchModeration} from "../../api/mod/[id]";
import FeedLayout from "../../../components/FeedLayout";
import Moderation from "../../../components/publication/mod/Moderation";
import Head from "next/head";
import MetaTags from "../../../components/MetaTags";
import Comments from "../../../components/publication/comment/Comments";

export default function ModerationPage({pub}) {
  const title = `Модерация @${pub.creator.J_NAME} в фэндоме ${pub.fandom.name} в Campfire`;
  return <FeedLayout
    list={<>
      <Head>
        <title>{title}</title>
        <MetaTags
          title={title} type="article"
          url={`https://campfire.moe/mod/${pub.id}`}
          image={`https://campfire.moe/api/image/${pub.creator.J_IMAGE_ID}`}
        />
      </Head>
      <Moderation pub={pub} />
      <Comments unitId={pub.id} addId totalComments={pub.subUnitsCount} />
    </>}
  />;
}

export async function getServerSideProps(ctx) {
  try {
    return {props: {pub: await fetchModeration(ctx.req, ctx.res, ctx.query.id)}};
  } catch (e) {
    return handleSSRError(e, ctx.res);
  }
}
