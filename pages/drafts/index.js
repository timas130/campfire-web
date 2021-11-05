import {useInfScroll, useUser} from "../../lib/client-api";
import Head from "next/head";
import FeedLayout, {FeedLoader} from "../../components/FeedLayout";
import Post from "../../components/publication/post/Post";
import {useRouter} from "next/router";

export default function Drafts() {
  const router = useRouter();
  const user = useUser();
  const {data: draftPages, ref, showLoader} = useInfScroll(
    user && `/api/drafts`, false, 5,
  );

  if (!user && !router) return <FeedLoader />;
  if (!user) {
    router.push(`/auth/login`);
    return null;
  }

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
