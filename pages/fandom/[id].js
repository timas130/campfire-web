import {fetchFandom} from "../api/fandom/[id]";
import FeedLayout, {FeedLoader} from "../../components/FeedLayout";
import FandomCard from "../../components/cards/FandomCard";
import Head from "next/head";
import Post from "../../components/publication/post/Post";
import useSWRInfinite from "swr/infinite";
import {useInView} from "react-intersection-observer";
import {useEffect} from "react";
import {fetcher} from "../../lib/client-api";

export default function Fandom({ fandom, profile, info }) {
  const {data: postPages, size, setSize} = useSWRInfinite((pageIndex) => {
    return `/api/fandom/${fandom.id}/posts?offset=${pageIndex * 20}`;
  }, fetcher, {
    revalidateOnFocus: false,
    revalidateIfStale: false,
    revalidateFirstPage: false,
  });
  const [ref, inView] = useInView();

  useEffect(() => {
    if (inView) {
      // noinspection JSIgnoredPromiseFromCall
      setSize(size + 1);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return <>
    <Head>
      <title>Фэндом {fandom.name} | Campfire</title>
    </Head>
    <FeedLayout
      list={<>
        {profile.pinnedPost && <Post post={profile.pinnedPost} />}
        {postPages && postPages.map(page => (
          page.map(post => <Post key={post.id} post={post} />)
        ))}
        <FeedLoader ref={ref} />
      </>}
      sidebar={<>
        <FandomCard fandom={fandom} profile={profile} info={info} />
      </>}
    />
  </>;
}

export async function getServerSideProps(ctx) {
  return {
    props: {
      ...(await fetchFandom(ctx.req, ctx.res, ctx.query.id)),
    },
  };
}
