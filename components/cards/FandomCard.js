import postClasses from "../../styles/Post.module.css";
import classes from "../../styles/Card.module.css";
import classNames from "classnames";
import {ExternalLinkIcon, LockClosedIcon, UsersIcon} from "@heroicons/react/solid";
import Button from "../Button";
import Tooltip from "../Tooltip";
import useSWRImmutable from "swr/immutable";
import {fetcher, useUser} from "../../lib/client-api";
import {KarmaCounter} from "../Karma";
import FandomHeader from "../FandomHeader";
import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import Link from "next/link";

export const SUB_TYPE_IMPORTANT = -1;
export const SUB_TYPE_SUBBED = 0;
export const SUB_TYPE_NONE = 1;

export default function FandomCard({ fandom, profile, info, fetchId = null, noLinks = false }) {
  const {data: fandomData} =
    useSWRImmutable(fetchId && `/api/fandom/${fetchId}`, fetcher, {
      fallbackData: fandom && {fandom, profile, info},
    });
  let {fandom: fandomL, profile: profileL, info: infoL} = fandomData || {};

  const loaded = Boolean(fandomL && profileL && infoL);

  const [subscriptionStatus, setSubscriptionStatus] = useState(SUB_TYPE_NONE);
  useEffect(() => {
    if (loaded) {
      setSubscriptionStatus(profileL.subscriptionType);
    }
  }, [loaded]); // eslint-disable-line

  const user = useUser();
  const router = useRouter();
  const changeSubscriptionStatus = () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }

    if (subscriptionStatus === SUB_TYPE_NONE) { // if not subscribed
      fetcher(`/api/fandom/${fandom.id}/sub?type=${SUB_TYPE_SUBBED}`)
        .then(() => setSubscriptionStatus(SUB_TYPE_SUBBED))
        .catch(e => alert("Ошибка: " + e));
    } else {
      fetcher(`/api/fandom/${fandom.id}/sub?type=${SUB_TYPE_NONE}`)
        .then(() => setSubscriptionStatus(SUB_TYPE_NONE))
        .catch(e => alert("Ошибка: " + e));
    }
  };

  return loaded ? <section className={classNames(postClasses.post, classes.cardContent)}>
    <FandomHeader
      fandom={fandomL} author={<>
        <UsersIcon />
        {fandomL.subscribesCount}
      </>} noPadding
      addRight={<>
        {fandomL.closed && <Tooltip text="Этот фэндом закрыт">
          <LockClosedIcon
            className={classes.fandomIcon}
          />
        </Tooltip>}
        <div className={classes.rubricCof}>
          <KarmaCounter value={fandomL.karmaCof} isCof />
        </div>
      </>}
    />
    <div className={classes.fandomButtons}>
      <Button fullWidth onClick={changeSubscriptionStatus}>
        {subscriptionStatus !== SUB_TYPE_NONE ? "Отписаться" : "Подписаться"}
      </Button>
      <Link href={`/drafts/0?fandom=${fandomL.id}`} passHref>
        <Button el="a" fullWidth>
          Создать пост
        </Button>
      </Link>
    </div>
    <div className={classes.fandomDescription}>
      {infoL.description}
    </div>
    {!noLinks && <div className={classes.fandomLinks}>
      {infoL.links.map(link => <a href={link.url} target="_blank" rel="noreferrer"
                                 key={link.index} className={classes.fandomLink}>
        <div className={classes.fandomLinkTitle}>{link.title}</div>
        <div className={classes.fandomLinkUrl}>
          <ExternalLinkIcon />
          {link.url}
        </div>
      </a>)}
    </div>}
  </section> : null;
}
