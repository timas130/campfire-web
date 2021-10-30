import {fetchTag} from "../../api/fandom/tags/[tagId]";

export default function Redirect() {
  // unreachable
  return null;
}

export async function getServerSideProps(ctx) {
  const tag = await fetchTag(ctx.req, ctx.res, ctx.query.id);
  return {
    redirect: {
      destination: `/fandom/${tag.fandom.id}/tags/${tag.id}`,
    },
  };
}
