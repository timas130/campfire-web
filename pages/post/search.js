import Head from "next/head";
import MetaTags from "../../components/MetaTags";
import FeedLayout from "../../components/FeedLayout";
import {instantMeiliSearch} from "@meilisearch/instant-meilisearch";
import {
  connectPagination,
  connectSearchBox,
  connectStats,
  Hits,
  InstantSearch,
  ScrollTo,
} from "react-instantsearch-dom";
import Post from "../../components/publication/post/Post";
import Button from "../../components/Button";
import Input from "../../components/Input";
import "instantsearch.css/themes/reset.css";
import classes from "../../styles/Search.module.css";
import {useMemo, useState} from "react";
import {useRouter} from "next/router";

export default function Search() {
  const query = useRouter().query.q;

  const {searchClient, CustomSearchBox, CustomStats, CustomPagination} = useMemo(() => {
    const searchClient = instantMeiliSearch(process.env.meiliUrl, process.env.meiliKey);

    const CustomSearchBox = connectSearchBox(({ refine }) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const [value, setValue] = useState("");
      return <form className={classes.bar} onSubmit={ev => {
        ev.preventDefault();
        refine(value);
      }}>
        <Input
          type="search" value={value}
          onChange={ev => setValue(ev.target.value)}
          placeholder="Поиск..." className={classes.input}
        />
        <Button type="submit">Поиск</Button>
      </form>;
    });
    const CustomStats = connectStats(({ nbHits, processingTimeMS }) => {
      return <div className={classes.stats}>Найдено {nbHits} за {processingTimeMS} мс</div>;
    });
    const CustomPagination = connectPagination(({ currentRefinement, refine, nbPages }) => {
      return <div className={classes.pagination}>
        <Button onClick={() => refine(1)}>«</Button>
        <Button onClick={() => currentRefinement > 1 && refine(currentRefinement - 1)}>←</Button>
        <span className={classes.paginationText}>{currentRefinement} из {nbPages}</span>
        <Button onClick={() => currentRefinement < nbPages && refine(currentRefinement + 1)}>→</Button>
        <Button onClick={() => refine(nbPages)}>»</Button>
      </div>;
    });

    return {searchClient, CustomSearchBox, CustomStats, CustomPagination};
  }, []);

  const title = "Поиск | Campfire";
  return <>
    <Head>
      <title>{title}</title>
      <MetaTags title={title} url="https://camp.33rd.dev/post/search" />
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
              <Post key={hit.hit.id} post={JSON.parse(hit.hit.raw_data)} /> :
              null
          } />
        <CustomPagination />
      </ScrollTo></InstantSearch>
    </>} />
  </>;
}
