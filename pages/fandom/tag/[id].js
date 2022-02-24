import {fetchTag} from "../../api/fandom/tags/[tagId]";
import {handleSSRError, mustInt} from "../../../lib/api";

export default function Redirect() {
  // unreachable
  return null;
}

export async function getServerSideProps(ctx) {
  try {
    const tag = await fetchTag(ctx.req, ctx.res, mustInt(ctx.query.id));
    return {
      redirect: {
        destination: `/fandom/${tag.fandom.id}/tags/${tag.id}`,
      },
    };
  } catch (e) {
    return handleSSRError(e, ctx.res);
  }
}
