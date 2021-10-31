import {fetchWikiItem} from "../../../api/fandom/wiki/[wikiId]";
import postClasses from "../../../../styles/Post.module.css";
import FeedLayout from "../../../../components/FeedLayout";
import Pages from "../../../../components/publication/post/pages/Pages";
import FandomHeader from "../../../../components/FandomHeader";
import moment from "moment";
import "moment/locale/ru";
import classNames from "classnames";

export default function WikiArticle({item, pages}) {
  return <FeedLayout
    list={<>
      <div className={postClasses.post}>
        <FandomHeader
          imageId={item.imageId} name={item.name}
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
  />;
}

export async function getServerSideProps(ctx) {
  return {
    props: {
      ...(await fetchWikiItem(ctx.req, ctx.res, ctx.query.id)),
    },
  };
}
