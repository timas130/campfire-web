import FeedLayout from "../../components/FeedLayout";
import Post from "../../components/publication/post/Post";
import AuthenticateCard from "../../components/cards/AuthenticateCard";
import {fetchComments} from "../api/post/[id]/comments";
import Head from "next/head";
import {useMemo} from "react";
import FandomCard from "../../components/cards/FandomCard";
import MetaTags from "../../components/MetaTags";
import Tags from "../../components/publication/post/Tags";
import {generateCoverForPages} from "../../lib/text-cover";
import {handleSSRError, mustInt} from "../../lib/api";
import {fetchPost} from "../api/post/[id]";
import Comments from "../../components/publication/comment/Comments";

export default function PostPage(props) {
  const shortDesc = useMemo(
    () => generateCoverForPages(
      typeof props.post.unit.jsonDB.J_PAGES === "string" ?
      JSON.parse(props.post.unit.jsonDB.J_PAGES) :
      props.post.unit.jsonDB.J_PAGES
    ),
    [props.post.unit]
  );
  const longDesc = useMemo(
    () => generateCoverForPages(
      typeof props.post.unit.jsonDB.J_PAGES === "string" ?
      JSON.parse(props.post.unit.jsonDB.J_PAGES) :
      props.post.unit.jsonDB.J_PAGES,
      100, 200,
    ),
    [props.post.unit]
  );

  const title = (shortDesc ? `"${shortDesc}"` : "Пост")
    + ` в ${props.post.unit.fandom.name} в Campfire`;
  return <>
    <Head>
      <title>{title}</title>
      <MetaTags
        title={title} type="article" description={longDesc}
        url={`https://campfire.moe/post/${props.post.unit.id}`}
        image={`https://campfire.moe/api/image/${props.post.unit.fandom.imageId}`}
      />
    </Head>
    <FeedLayout
      list={<>
        <Post post={props.post.unit} alwaysExpanded main />
        <Tags tags={props.post.tags} />
        <Comments unitId={props.post.unit.id} addId fallback={props.comments}
                  totalComments={props.post.unit.subUnitsCount} />
      </>}
      sidebar={<>
        <FandomCard fetchId={props.post.unit.fandom.id} noLinks />
        <AuthenticateCard />
      </>}
    />
  </>;
}

export async function getStaticProps(ctx) {
  try {
    return {
      props: {
        post: await fetchPost(null, null, mustInt(ctx.params.id)),
        comments: await fetchComments(null, null, mustInt(ctx.params.id)),
      },
      revalidate: 60,
    };
  } catch (e) {
    return handleSSRError(e, {}, true);
  }
}

export async function getStaticPaths() {
  return { paths: [], fallback: "blocking" };
}
