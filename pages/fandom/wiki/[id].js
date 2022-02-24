import {fetchWikiItem} from "../../api/fandom/wiki/[wikiId]";
import postClasses from "../../../styles/Post.module.css";
import FeedLayout from "../../../components/FeedLayout";
import Pages from "../../../components/publication/post/pages/Pages";
import FandomHeader from "../../../components/FandomHeader";
import moment from "moment";
import "moment/locale/ru";
import classNames from "classnames";
import {getWikiName} from "../../../components/WikiListItem";
import Head from "next/head";
import MetaTags from "../../../components/MetaTags";
import {handleSSRError, mustInt} from "../../../lib/api";

export default function WikiArticle({item, pages}) {
  // TODO: fandom name, maybe async to improve load times?
  const title = `${getWikiName(item)} | Вики | Campfire`;
  return <>
    <Head>
      <title>{title}</title>
      <MetaTags title={title} url={`https://camp.33rd.dev/fandom/wiki/${item.itemId}`} />
    </Head>
    <FeedLayout
      list={<>
        <div className={postClasses.post}>
          <FandomHeader
            imageId={item.imageId} name={getWikiName(item)}
            link={`/fandom/${item.fandomId}/wiki/${item.itemId}/article`}
            author={"Обновлено: " + moment(item.changeDate).locale("ru").calendar()}
          />
        </div>
        <div className={postClasses.post}>
          <div className={classNames(postClasses.content, postClasses.expanded)}>
            <Pages pages={pages.pages} />
          </div>
        </div>
      </>}
    />
  </>;
}

export async function getServerSideProps(ctx) {
  try {
    return {
      props: {
        ...(await fetchWikiItem(ctx.req, ctx.res, mustInt(ctx.params.id))),
      },
    };
  } catch (e) {
    return handleSSRError(e, ctx.res);
  }
}
