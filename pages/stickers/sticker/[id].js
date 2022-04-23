import {fetchStickerPack} from "../../api/stickers/[id]";

export default function Unreachable() {
  return null;
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}

export async function getStaticProps(ctx) {
  const {info} = await fetchStickerPack(null, null, null, ctx.params.id);
  return {
    redirect: {
      destination: `/stickers/${info.id}`,
    },
  };
}
