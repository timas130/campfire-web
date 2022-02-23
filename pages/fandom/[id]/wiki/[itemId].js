import {useInfScroll} from "../../../../lib/client-api";
import Head from "next/head";
import {fetchWikiList} from "../../../api/fandom/[id]/wiki";
import {fetchFandomBasic} from "../../../api/fandom/[id]";
import MetaTags from "../../../../components/MetaTags";
import FeedLayout, {FeedLoader} from "../../../../components/FeedLayout";
import WikiListItem, {getWikiName} from "../../../../components/WikiListItem";
import cardClasses from "../../../../styles/Card.module.css";
import {ArrowLeftIcon} from "@heroicons/react/solid";
import classNames from "classnames";
import {fetchWikiItem} from "../../../api/fandom/wiki/[wikiId]";
import {handleSSRError} from "../../../../lib/api";

export async function getServerSideProps(ctx) {
  try {
    return {
      props: {
        fandomId: ctx.params.id,
        itemId: ctx.params.itemId,
        list: await fetchWikiList(ctx.req, ctx.res, ctx.params.id, 0, ctx.params.itemId),
        fandom: await fetchFandomBasic(ctx.req, ctx.res, ctx.params.id),
        item: parseInt(ctx.params.itemId) !== 0 ?
          (await fetchWikiItem(ctx.req, ctx.res, ctx.params.itemId)).item :
          null,
      },
    };
  } catch (e) {
    return handleSSRError(e, ctx.res);
  }
}

export default function WikiSection({fandomId, list, itemId, fandom, item}) {
  return WikiSectionPage(fandomId, itemId, [list], fandom, item);
}

export function WikiSectionPage(fandomId, itemId, fallback = [], fandom = null, item = null) {
  const {data: wikiListPages, showLoader, ref} = useInfScroll(
    `/api/fandom/${fandomId}/wiki/${itemId}`,
    false, 20,
    fallback
  );

  let title;
  if (fandom)
    if (item)
      title = `${getWikiName(item)} | Вики ${fandom.name} | Campfire`;
    else
      title = `Вики | ${fandom.name} | Campfire`;
  else
    title = "Вики фэндома | Campfire";
  return <>
    <Head>
      <title>{title}</title>
      <MetaTags title={title} url={`https://camp.33rd.dev/fandom/${fandomId}/wiki/${itemId}`} />
    </Head>
    <FeedLayout
      list={<>
        <a
          href={item ? `/fandom/${fandomId}/wiki/${item.parentItemId}` : `/fandom/${fandomId}`}
          className={classNames(cardClasses.fandomSubs, cardClasses.moreFandoms)}
        >
          <ArrowLeftIcon />
          Назад
        </a>

        {wikiListPages.map(page => page.map(
          wikiItem => <WikiListItem key={wikiItem.id} fandomId={fandomId} item={wikiItem} />
        ))}
        {showLoader && <FeedLoader ref={ref} />}
      </>}
    />
  </>;
}
