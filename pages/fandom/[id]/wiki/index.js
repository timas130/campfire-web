import {WikiSectionPage} from "./[itemId]";
import {fetchWikiList} from "../../../api/fandom/[id]/wiki";
import {fetchFandomBasic} from "../../../api/fandom/[id]";
import {handleSSRError} from "../../../../lib/api";

export default function WikRoot({fandomId, list, fandom}) {
  return WikiSectionPage(fandomId, 0, [list], fandom);
}

export async function getServerSideProps(ctx) {
  try {
    return {
      props: {
        fandomId: ctx.params.id,
        list: await fetchWikiList(ctx.req, ctx.res, ctx.params.id),
        fandom: await fetchFandomBasic(ctx.req, ctx.res, ctx.params.id),
      },
    };
  } catch (e) {
    return handleSSRError(e, ctx.res);
  }
}
