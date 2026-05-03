import classNames from "classnames";
import classes from "../styles/NotFound.module.css";
import Head from "next/head";
import Button from "../components/controls/Button";
import {useRouter} from "next/router";

export default function NotFoundPage() {
  const router = useRouter();
  return <>
    <Head>
      <title>Не найдено | Bonfire</title>
    </Head>
    <div className={classNames("container", classes.root)}>
      <h1>Похоже, всё пропало</h1>
      <p className={classes.text}>Либо эту страницу удалили модераторы, либо её никогда не существовало.</p>
      <Button onClick={() => router.back()}>Вернуться назад</Button>
    </div>
  </>;
}
