import CImage from "../components/CImage";
import classNames from "classnames";
import classes from "../styles/NotFound.module.css";
import Head from "next/head";
import Button from "../components/Button";
import {useRouter} from "next/router";

export default function NotFoundPage() {
  const router = useRouter();
  return <>
    <Head>
      <title>Не найдено | Campfire</title>
    </Head>
    <div className={classNames("container", classes.root)}>
      <div className={classes.image}><CImage id={419884} w={513/2.5} h={379/2.5} /></div>
      <h1>Похоже, всё пропало</h1>
      <p className={classes.text}>Либо эту страницу удалили модераторы, либо её никогда не существовало.</p>
      <Button onClick={() => router.back()}>Вернуться назад</Button>
    </div>
  </>;
}
