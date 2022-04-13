import {useInfScroll} from "../../../../lib/client-api";
import Head from "next/head";
import {fetchWikiList} from "../../../api/fandom/[id]/wiki";
import {fetchFandomBasic} from "../../../api/fandom/[id]";
import MetaTags from "../../../../components/MetaTags";
import FeedLayout, {FeedLoader} from "../../../../components/FeedLayout";
import WikiListItem, {getWikiName} from "../../../../components/WikiListItem";
import {ArrowLeftIcon} from "@heroicons/react/solid";
import {fetchWikiItem} from "../../../api/fandom/wiki/[wikiId]";
import {handleSSRError, mustInt} from "../../../../lib/api";
import IconLink from "../../../../components/IconLink";

export async function getServerSideProps(ctx) {
  try {
    return {
      props: {
        fandomId: mustInt(ctx.params.id),
        itemId: mustInt(ctx.params.itemId),
        list: await fetchWikiList(ctx.req, ctx.res, mustInt(ctx.params.id), 0, mustInt(ctx.params.itemId)),
        fandom: await fetchFandomBasic(ctx.req, ctx.res, mustInt(ctx.params.id)),
        item: mustInt(ctx.params.itemId) !== 0 ?
          (await fetchWikiItem(ctx.req, ctx.res, mustInt(ctx.params.itemId))).item :
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
  if (fandom) {
    if (item) title = `${getWikiName(item)} в вики ${fandom.name} в Campfire`;
    else title = `Вики ${fandom.name} в Campfire`;
  } else {
    title = "Вики фэндома в Campfire";
  }

  const wikiList = wikiListPages.flat();

  return <>
    <Head>
      <title>{title}</title>
      <MetaTags
        title={title}
        url={`https://campfire.moe/fandom/${fandomId}/wiki/${itemId}`}
        image={`https://campfire.moe/api/image/${item?.imageId || fandom.imageId}`}
      />
    </Head>
    <FeedLayout
      list={<>
        <IconLink
          href={item ? `/fandom/${fandomId}/wiki/${item.parentItemId}` : `/fandom/${fandomId}`}
          right
        >
          <ArrowLeftIcon />
          Назад {!item && "в фэндом"}
        </IconLink>

        {wikiList.map(item => <WikiListItem key={item.id} fandomId={fandomId} item={item} />)}
        {wikiList.length === 0 && <FeedLoader text="Этот раздел вики пустой" />}
        {showLoader && <FeedLoader ref={ref} />}
      </>}
    />
  </>;
}
