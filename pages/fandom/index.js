import FeedLayout, {FeedLoader} from "../../components/FeedLayout";
import NoticeCard from "../../components/cards/NoticeCard";
import {useInfScroll} from "../../lib/client-api";
import FandomHeader from "../../components/FandomHeader";
import cardClasses from "../../styles/Card.module.css";
import classes from "../../styles/Card.module.css";
import {LockClosedIcon, UsersIcon} from "@heroicons/react/solid";
import classNames from "classnames";
import {KarmaCounter} from "../../components/Karma";
import Tooltip from "../../components/Tooltip";
import Head from "next/head";
import MetaTags from "../../components/MetaTags";

export default function Fandoms() {
  const {data: fandomPages, ref, showLoader} = useInfScroll("/api/fandom");

  return <>
    <Head>
      <title>Популярные фэндомы | Campfire</title>
      <MetaTags
        title="Популярные фэндомы | Campfire"
        url="https://campfire.moe/fandom"
      />
    </Head>
    <FeedLayout
      list={<>
        {fandomPages && fandomPages.map(page => page.map(fandom => (
          <FandomHeader
            key={fandom.id} fandom={fandom} dense
            author={<span className={classNames(cardClasses.fandomSubs, cardClasses.left)}>
              <UsersIcon />
              {fandom.subscribesCount}
            </span>}
            addRight={<>
              {fandom.karmaCof !== 100 && <KarmaCounter value={fandom.karmaCof} isCof />}
              {fandom.closed && <Tooltip text="Этот фэндом закрыт">
                <LockClosedIcon className={classes.fandomIcon} />
              </Tooltip>}
            </>}
          />
        )))}
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
