import {useRouter} from "next/router";
import Head from "next/head";
import MetaTags from "../../components/MetaTags";
import FeedLayout, {FeedLoader} from "../../components/FeedLayout";
import Post from "../../components/publication/post/Post";
import useSWR from "swr";
import {fetcher} from "../../lib/client-api";
import Input from "../../components/Input";
import classes from "../../styles/Search.module.css";
import Button from "../../components/Button";

export default function Search() {
  const router = useRouter();
  const q = router.query.q;
  const { data: results, error } = useSWR(
    q ? ("/api/post/search?q=" + encodeURIComponent(q)) : null,
    fetcher
  );

  const onSubmit = ev => {
    ev.preventDefault();
    const data = new FormData(ev.target);
    router.replace("/post/search?q=" + encodeURIComponent(data.get("q")));
  };

  const title = `Поиск "${q}" | Campfire`;
  return <>
    <Head>
      <title>{title}</title>
      <MetaTags title={title} url="https://camp.33rd.dev/post/search" />
    </Head>
    <FeedLayout list={<>
      <form method="GET" action="/post/search" onSubmit={onSubmit} className={classes.bar}>
        <Input placeholder="Поиск..." name="q" className={classes.input} />
        <Button type="submit">Найти</Button>
      </form>
      {results ?
        results.map(post => <Post key={post.id} post={post} />) :
        q ?
          error ? <FeedLoader text="Ошибка" /> : <FeedLoader /> :
          <FeedLoader text="Введите ваш запрос" />}
    </>} />
  </>;
}
