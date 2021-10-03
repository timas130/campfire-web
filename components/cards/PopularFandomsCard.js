import postClasses from "../../styles/Post.module.css";
import cardClasses from "../../styles/Card.module.css";
import classNames from "classnames";
import Link from "next/link";
import {CAvatar} from "../CImage";
import {ArrowRightIcon, UsersIcon} from "@heroicons/react/solid";

export default function PopularFandomsCard({ fandoms, limit = 5 }) {
  return <div className={postClasses.post}>
    <div className={cardClasses.cardTitle}>
      Популярные фэндомы
    </div>
    <ul className={classNames(cardClasses.cardContent, cardClasses.popularFandoms)}>
      {fandoms
        .filter(fandom => fandom.id !== 5672)
        .slice(0, limit)
        .map(fandom => <Link href={`/fandom/${fandom.id}`} key={fandom.id}><a>
          <CAvatar fandom={fandom} small className={cardClasses.fandomAvatar} el="div" />
          <span className={cardClasses.fandomName}>{fandom.name}</span>
          <span className={cardClasses.fandomSubs}>
            <UsersIcon />
            {fandom.subscribesCount}
          </span>
        </a></Link>)}
      <Link href="/fandoms"><a className={cardClasses.moreFandoms}>
        Посмотреть другие фэндомы
        <ArrowRightIcon />
      </a></Link>
    </ul>
  </div>;
}
