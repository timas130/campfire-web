import {useInfScroll, useUser} from "../../lib/client-api";
import Head from "next/head";
import FeedLayout, {FeedLoader} from "../../components/FeedLayout";
import Post from "../../components/publication/post/Post";
import {useRouter} from "next/router";
import {useEffect} from "react";

export default function Drafts() {
  const router = useRouter();
  const user = useUser();
  const {data: draftPages, ref, showLoader} = useInfScroll(
    user && `/api/drafts`, false, 5,
  );

  useEffect(() => {
    if (!user && router) {
      router.push(`/auth/login`);
    }
  }, [router, user]);
  if (!user && !router) return <FeedLoader />;
  if (!user) return null;

  return <>
    <Head>
      <title>Черновики | Campfire</title>
    </Head>
    <FeedLayout
      list={<>
        {draftPages && draftPages.map(page => page.map(draft => <Post draft post={draft} key={draft.id} />))}
        {showLoader && <FeedLoader ref={ref} />}
      </>}
    />
  </>;
}
