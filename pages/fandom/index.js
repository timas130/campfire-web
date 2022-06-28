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
  const {data: user, isValidating} = useSWRUser();
  const {data: fandomSub, ref: subRef, showLoader: subLoader}
    = useInfScroll(user && `/api/fandom?account=${user.J_ID}`);
  const {data: fandomPages, ref, showLoader}
    = useInfScroll("/api/fandom");

  const subFlat = (fandomSub || []).flat();
  const globalFlat = (fandomPages || []).flat().filter(a => !subFlat.find(b => a.id === b.id));

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
        {(user || isValidating) && <>
          <h2 className={classes.fandomDivider}>Подписки</h2>
          {subFlat.map(fandom => <Fandom fandom={fandom} key={fandom.id} />)}
          {subLoader && <FeedLoader ref={subRef} />}
        </>}
        <h2 className={classes.fandomDivider}>Все фэндомы</h2>
        {globalFlat.map(fandom => <Fandom fandom={fandom} key={fandom.id} />)}
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
