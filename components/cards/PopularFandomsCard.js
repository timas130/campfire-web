import postClasses from "../../styles/Post.module.css";
import cardClasses from "../../styles/Card.module.css";
import classNames from "classnames";
import Link from "next/link";
import {CAvatar} from "../CImage";
import {ArrowRightIcon, UsersIcon} from "@heroicons/react/solid";
import useSWR from "swr/immutable";
import {BoxPlaceholder, TextPlaceholder} from "../Placeholder";
import {fetcher} from "../../lib/client-api";

export default function PopularFandomsCard({ limit = 5, shuffle = false }) {
  let { data: fandoms } = useSWR(`/api/fandom?card=${shuffle}`, fetcher);
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
      <Link href="/fandom"><a className={cardClasses.moreFandoms}>
        Посмотреть другие фэндомы
        <ArrowRightIcon />
      </a></Link>
    </div>
  </section>;
}
