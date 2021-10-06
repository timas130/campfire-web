import {fetchFandom} from "../api/fandom/[id]";
import FeedLayout from "../../components/FeedLayout";
import FandomCard from "../../components/cards/FandomCard";
import Head from "next/head";

export default function Fandom({ fandom, profile, info }) {
  return <>
    <Head>
      <title>Фэндом {fandom.name} | Campfire</title>
    </Head>
    <FeedLayout
      list={"wip"}
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
