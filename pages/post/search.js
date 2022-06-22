import Head from "next/head";
import MetaTags from "../../components/MetaTags";
import FeedLayout from "../../components/FeedLayout";
import Publication from "../../components/publication/Publication.js"; 
import Button from "../../components/controls/Button";
import "instantsearch.css/themes/reset.css";
import {useRouter} from "next/router";
import dynamic from "next/dynamic";
import {instantMeiliSearch} from "@meilisearch/instant-meilisearch";

const searchClient = instantMeiliSearch(process.env.meiliUrl, process.env.meiliKey);

const Hits = dynamic(() => import("react-instantsearch-dom").then(a => a.Hits));
const InstantSearch = dynamic(() => import("react-instantsearch-dom").then(a => a.InstantSearch));
const ScrollTo = dynamic(() => import("react-instantsearch-dom").then(a => a.ScrollTo));

const CustomPagination = dynamic(() => import("../../lib/search").then(a => a.CustomPagination));
const CustomStats = dynamic(() => import("../../lib/search").then(a => a.CustomStats));
const CustomSearchBox = dynamic(() => import("../../lib/search").then(a => a.CustomSearchBox));

export default function Search() {
  const query = useRouter().query.q;

  const title = "Поиск постов в Campfire";
  return <>
    <Head>
      <title>{title}</title>
      <MetaTags title={title} url="https://campfire.moe/post/search" />
    </Head>
    <FeedLayout list={<>
      <InstantSearch
        indexName="post"
        searchClient={searchClient}
        createURL={searchState => `?q=${encodeURIComponent(searchState.query)}`}
      ><ScrollTo>
        <CustomSearchBox
          submit={<Button>Поиск</Button>}
          reset={null} defaultRefinement={query}
          searchAsYouType={false}
        />
        <CustomStats />
        <CustomPagination />
          <Hits hitComponent={hit =>
            hit.hit ?
              <Publication key={hit.hit.id} post={JSON.parse(hit.hit.raw_data)} full showBestComment /> :
              null
          } />
        <CustomPagination />
      </ScrollTo></InstantSearch>
    </>} />
  </>;
}
