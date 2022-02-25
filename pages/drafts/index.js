import {useInfScroll} from "../../lib/client-api";
import Head from "next/head";
import FeedLayout, {FeedLoader} from "../../components/FeedLayout";
import Post from "../../components/publication/post/Post";

export default function Drafts() {
  const {data: draftPages, ref, showLoader} = useInfScroll(
    "/api/drafts", false, 5,
  );

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
