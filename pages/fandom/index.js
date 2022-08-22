import FeedLayout, {FeedLoader} from "../../components/FeedLayout";
import NoticeCard from "../../components/cards/NoticeCard";
import {useInfScroll, useSWRUser} from "../../lib/client-api";
import FandomHeader from "../../components/FandomHeader";
import cardClasses from "../../styles/Card.module.css";
import classes from "../../styles/Card.module.css";
import {LockClosedIcon, UsersIcon} from "@heroicons/react/solid";
import classNames from "classnames";
import {KarmaCounter} from "../../components/Karma";
import Tooltip from "../../components/Tooltip";
import Head from "next/head";
import MetaTags from "../../components/MetaTags";
import searchClasses from "../../styles/Search.module.css";
import Input from "../../components/controls/Input";
import Button from "../../components/controls/Button";
import {useEffect, useState} from "react";
import {useRouter} from "next/router";

function Fandom({fandom}) {
  return <FandomHeader
    key={fandom.id} fandom={fandom} dense
    author={<span className={classNames(cardClasses.fandomSubs, cardClasses.left)}>
      <UsersIcon />
      {fandom.subscribesCount}
    </span>}
    addRight={<>
      {fandom.karmaCof !== 100 && fandom.karmaCof !== 0 && <KarmaCounter value={fandom.karmaCof} isCof />}
      {fandom.closed && <Tooltip text="Этот фэндом закрыт">
        <LockClosedIcon className={classes.fandomIcon} />
      </Tooltip>}
    </>}
  />;
}

export default function Fandoms() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (router.isReady) setSearchQuery(router.query.q);
  }, [router.isReady, router.query.q]);

  const {data: user, isValidating} = useSWRUser();
  const {data: fandomSub, ref: subRef, showLoader: subLoader}
    = useInfScroll(user && `/api/fandom?account=${user.J_ID}`);
  const {data: fandomPages, ref, showLoader}
    = useInfScroll(`/api/fandom?query=${encodeURIComponent(searchQuery)}`);

  const subFlat = (fandomSub || []).flat();
  const globalFlat = (fandomPages || []).flat()
    .filter(a => searchQuery || !subFlat.find(b => a.id === b.id));

  const submit = ev => {
    ev.preventDefault();
    const query = new FormData(ev.target).get("q");
    setSearchQuery(query);
    router.replace("/fandom", "/fandom?q=" + encodeURIComponent(query));
  };

  return <>
    <Head>
      <title>Популярные фэндомы в Campfire</title>
      <MetaTags
        title="Популярные фэндомы в Campfire"
        url="https://campfire.moe/fandom"
      />
    </Head>
    <FeedLayout
      list={<>
        <form className={searchClasses.bar} action="/fandom" method="get" onSubmit={submit}>
          <Input type="search" placeholder="Поиск фэндомов" name="q"
                 className={searchClasses.input} defaultValue={searchQuery} />
          <Button type="submit">Искать</Button>
        </form>
        {(user || isValidating) && !searchQuery && <>
          <h2 className={classes.fandomDivider}>Подписки</h2>
          {subFlat.map(fandom => <Fandom fandom={fandom} key={`${fandom.id}-${fandom.languageId}`} />)}
          {subLoader && <FeedLoader ref={subRef} />}
        </>}
        <h2 className={classes.fandomDivider}>
          {searchQuery ? "Поиск по фэндомам" : "Все фэндомы"}
        </h2>
        {globalFlat.map(fandom => <Fandom fandom={fandom} key={`${fandom.id}-${fandom.languageId}`} />)}
        {showLoader && <FeedLoader ref={ref} />}
      </>}
      sidebar={<>
        <NoticeCard
          title="Фэндомы"
          content={
            "Все посты создаются в фэндомах, именно в них собираются " +
            "люди которых объединяет общий интерес. Подпишитесь на интересные вам " +
            "фэндомы, тогда их посты будут отображаться в ленте в разделе подписок."
          }
        />
      </>}
    />
  </>;
}
