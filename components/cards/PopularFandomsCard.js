import postClasses from "../../styles/Post.module.css";
import cardClasses from "../../styles/Card.module.css";
import classNames from "classnames";
import Link from "next/link";
import {CAvatar} from "../CImage";
import {ArrowRightIcon, UsersIcon} from "@heroicons/react/solid";
import useSWRImmutable from "swr/immutable";
import {BoxPlaceholder, TextPlaceholder} from "../Placeholder";
import {fetcher} from "../../lib/client-api";
import {useMemo} from "react";
import IconLink from "../IconLink";

// s/o 2450954#2450976
function shuffleArray(array) {
  let currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

export default function PopularFandomsCard({ limit = 5, shuffle = true }) {
  let { data: fandomsL } = useSWRImmutable("/api/fandom", fetcher);

  const fandoms = useMemo(
    () => (shuffle && fandomsL) ? shuffleArray([...fandomsL]) : fandomsL,
    [fandomsL, shuffle]
  );

  return <section className={postClasses.post}>
    <header className={cardClasses.cardTitle}>
      Популярные фэндомы
    </header>
    <div className={classNames(cardClasses.cardContent, cardClasses.popularFandoms)}>
      {!fandoms ?
        Array(limit)
          .fill(null)
          .map((x, idx) => <div key={idx} className={cardClasses.popularFandom}>
            <BoxPlaceholder w={30} h={30} className={cardClasses.fandomAvatar} />
            <TextPlaceholder className={cardClasses.fandomName} />
          </div>) :
        fandoms
          .filter(fandom => fandom.id !== 5672)
          .slice(0, limit)
          .map(fandom => <Link href={`/fandom/${fandom.id}`} key={fandom.id}>
            <a className={cardClasses.popularFandom}>
              <CAvatar fandom={fandom} small className={cardClasses.fandomAvatar} el="div" />
              <span className={cardClasses.fandomName}>{fandom.name}</span>
              <span className={cardClasses.fandomSubs}>
                <UsersIcon />
                {fandom.subscribesCount}
              </span>
            </a>
          </Link>)}
      <IconLink href="/fandom" left top bottom={false}>Другие фэндомы <ArrowRightIcon /></IconLink>
    </div>
  </section>;
}
