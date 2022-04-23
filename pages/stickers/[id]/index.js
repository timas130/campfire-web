import {handleSSRError, mustInt} from "../../../lib/api";
import {fetchStickerPack} from "../../api/stickers/[id]";
import FeedLayout from "../../../components/FeedLayout";
import postClasses from "../../../styles/Post.module.css";
import FandomHeader from "../../../components/FandomHeader";
import {useMemo} from "react";
import ShareButton from "../../../components/controls/ShareButton";
import Karma from "../../../components/Karma";
import classes from "../../../styles/Stickers.module.css";
import CImage from "../../../components/CImage";
import Head from "next/head";
import MetaTags from "../../../components/MetaTags";
import Comments from "../../../components/publication/comment/Comments";

export function StickerPackCard({info}) {
  return <div className={postClasses.post}>
    <FandomHeader
      el="div"
      imageId={info.jsonDB.imageId}
      name={info.jsonDB.name}
      link={`/stickers/${info.id}`}
      authorLink={`/account/${encodeURIComponent(info.creator.J_NAME)}`}
      author={info.creator.J_NAME}
      addRight={<ShareButton link={`/stickers/${info.id}`} noMr />}
    />
    <div className={classes.cardContent}>
      <Karma pub={info} />
    </div>
  </div>;
}

export default function StickerPack({info: infoL, list}) {
  const info = useMemo(() => {
    if (typeof infoL.jsonDB === "string") {
      infoL.jsonDB = JSON.parse(infoL.jsonDB);
    }
    return infoL;
  }, [infoL]);

  const title = `Стикеры ${info.jsonDB.name} в Campfire`;
  return <FeedLayout
    list={<>
      <Head>
        <title>{title}</title>
        <MetaTags
          title={title}
          url={`https://campfire.moe/stickers/${info.id}`}
        />
      </Head>
      <div className={classes.list}>
        {list.map(sticker => <CImage
          key={sticker.id}
          id={typeof sticker.jsonDB === "string" ?
            JSON.parse(sticker.jsonDB).imageId :
            sticker.jsonDB.imageId}
          w={256}
          h={256}
          modal
        />)}
      </div>
      <Comments unitId={info.id} totalComments={info.id.subUnitsCount} />
    </>}
    staticSidebar={<>
      <StickerPackCard info={info} />
    </>}
  />;
}

export async function getServerSideProps(ctx) {
  try {
    return {
      props: {
        ...(await fetchStickerPack(null, null, mustInt(ctx.params.id))),
      },
    };
  } catch (e) {
    return handleSSRError(e, {}, true);
  }
}
