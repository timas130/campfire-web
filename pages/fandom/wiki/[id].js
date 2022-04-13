import {fetchWikiItem} from "../../api/fandom/wiki/[wikiId]";
import postClasses from "../../../styles/Post.module.css";
import FeedLayout, {FeedLoader} from "../../../components/FeedLayout";
import Pages from "../../../components/publication/post/pages/Pages";
import FandomHeader from "../../../components/FandomHeader";
import dayjs from "../../../lib/time";
import classNames from "classnames";
import {getWikiName} from "../../../components/WikiListItem";
import Head from "next/head";
import MetaTags from "../../../components/MetaTags";
import {handleSSRError, mustInt} from "../../../lib/api";
import TextPage from "../../../components/publication/post/pages/TextPage";
import {fetchFandomBasic} from "../../api/fandom/[id]";

export default function WikiArticle({item, fandom, pages, ...rest}) {
  const title = `${getWikiName(item)} в вики ${fandom.name} в Campfire`;
  const pagesContent = (pages || {}).pages || [];
  return <>
    <Head>
      <title>{title}</title>
      <MetaTags
        title={title} type="article"
        url={`https://campfire.moe/fandom/wiki/${item.itemId}`}
        image={`https://campfire.moe/api/image/${item?.imageId || fandom.imageId}`}
      />
    </Head>
    <FeedLayout
      list={<>
        <div className={postClasses.post}>
          <FandomHeader
            imageId={item.imageId} name={getWikiName(item)}
            link={`/fandom/${item.fandomId}/wiki/${item.itemId}`}
            author={"Обновлено " + dayjs(item.changeDate).locale("ru").calendar()}
          />
        </div>
        <div className={postClasses.post}>
          <div className={classNames(postClasses.content, postClasses.expanded)}>
            <Pages pages={pagesContent} />
            {pagesContent.length === 0 && <TextPage page={{J_TEXT: "{_cweb_secondary Статья ещё не заполнена}"}} />}
          </div>
        </div>
      </>}
    />
  </>;
}

export async function getServerSideProps(ctx) {
  try {
    const wikiItem = await fetchWikiItem(ctx.req, ctx.res, mustInt(ctx.params.id));
    return {props: {
      ...wikiItem,
      fandom: await fetchFandomBasic(ctx.req, ctx.res, mustInt(wikiItem.item.fandomId)),
    }};
  } catch (e) {
    return handleSSRError(e, ctx.res);
  }
}
