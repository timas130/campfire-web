import {handleSSRError, mustInt} from "../../../../lib/api";
import {fetchTags} from "../../../api/fandom/tags";
import FeedLayout from "../../../../components/FeedLayout";
import classes from "../../../../styles/Draft.module.css";
import {Tag} from "../../../../components/publication/post/Tags";
import {fetchFandomBasic} from "../../../api/fandom/[id]";
import FandomHeader from "../../../../components/FandomHeader";
import {ArrowLeftIcon, UsersIcon} from "@heroicons/react/solid";
import postClasses from "../../../../styles/Post.module.css";
import NoticeCard from "../../../../components/cards/NoticeCard";
import classNames from "classnames";
import Head from "next/head";
import MetaTags from "../../../../components/MetaTags";
import IconLink from "../../../../components/IconLink";

export default function TagsListPage({tags, fandom}) {
  const title = `Теги ${fandom.name} | Campfire`;
  return <>
    <Head>
      <title>{title}</title>
      <MetaTags
        url={`https://campfire.moe/fandom/${fandom.id}/tags`}
        title={title}
      />
    </Head>
    <FeedLayout
      list={<>
        <IconLink href={`/fandom/${fandom.id}`} right>
          <ArrowLeftIcon />
          Назад к фэндому {fandom.name}
        </IconLink>
        {tags
          .filter(tag => !tag.parentUnitId)
          .map(parentTag => <div key={parentTag.id}>
            <h3 className={classes.tagHeader}>{parentTag.jsonDB.J_NAME}</h3>
            {tags
              .filter(tag => tag.parentUnitId === parentTag.id)
              .map(tag => <Tag key={tag.id} tag={tag} />)}
          </div>)}
      </>}
      staticSidebar={<>
        <div className={classNames(postClasses.post, postClasses.mb05)}>
          <FandomHeader
            fandom={fandom} author={<><UsersIcon />{fandom.subscribesCount}</>}
          />
        </div>
        <NoticeCard
          title="Теги"
          content={
            "Теги — категории постов на разные темы. При создании поста " +
            "можно самому выбрать какие теги на нём будут, однако модераторы " +
            "могут их изменить. Нажмите на любой тег тут, чтобы посмотреть посты " +
            "в нём."
          }
        />
      </>}
    />
  </>;
}

export async function getServerSideProps(ctx) {
  try {
    const results = await Promise.all([
      fetchTags(ctx.req, ctx.res, mustInt(ctx.query.id)),
      fetchFandomBasic(ctx.req, ctx.res, mustInt(ctx.query.id)),
    ]);
    return {
      props: {
        tags: results[0],
        fandom: results[1],
      },
    };
  } catch (e) {
    return handleSSRError(e, ctx.res);
  }
}
