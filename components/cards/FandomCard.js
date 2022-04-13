import postClasses from "../../styles/Post.module.css";
import classes from "../../styles/Card.module.css";
import classNames from "classnames";
import {
  BookOpenIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ExternalLinkIcon,
  InformationCircleIcon,
  LockClosedIcon,
  TagIcon,
  UsersIcon,
} from "@heroicons/react/solid";
import Button from "../controls/Button";
import Tooltip from "../Tooltip";
import useSWRImmutable from "swr/immutable";
import {fetcher, useUser} from "../../lib/client-api";
import {KarmaCounter} from "../Karma";
import FandomHeader from "../FandomHeader";
import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import Link from "next/link";
import IconLink from "../IconLink";
import CImage from "../CImage";
import {Tag} from "../publication/post/Tags";
import tags from "./FandomCard_data.json";
import FormattedText from "../FormattedText";

export const SUB_TYPE_IMPORTANT = -1;
export const SUB_TYPE_SUBBED = 0;
export const SUB_TYPE_NONE = 1;

const shitCache = {};

function toShittyIdx(cat, idx) {
  const sorted = shitCache[cat] ?? Object.keys(tags).filter(x => x.startsWith(cat + "_")).sort();
  shitCache[cat] = sorted;
  return sorted[idx];
}

// TODO: Fandom gallery

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

  const [expanded, setExpanded] = useState(false);

  return loaded ? <section className={classNames(postClasses.post)}>
    <CImage id={fandomL.imageTitleId} w={800} h={400} className={classes.fandomTitleImg} />
    <FandomHeader
      fandom={fandomL} author={<>
        <UsersIcon />
        {fandomL.subscribesCount}
      </>}
      addRight={<>
        <Tooltip text="Коэффициент кармы" className={classes.rubricCof}>
          <KarmaCounter value={fandomL.karmaCof} isCof />
        </Tooltip>
        {fandomL.closed && <Tooltip text="Этот фэндом закрыт">
          <LockClosedIcon
            className={classes.fandomIcon}
          />
        </Tooltip>}
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
      <FormattedText text={infoL.description.trim() || "{_cweb_secondary Нет описания}"} />
    </div>
    <div className={classes.fandomLinks}>
      <IconLink href={`/fandom/${fandomL.id}/tags`} right primary>
        <TagIcon />Все теги
      </IconLink>
      <IconLink href={`/fandom/${fandomL.id}/wiki`} right primary>
        <BookOpenIcon />Вики фэндома
      </IconLink>
    </div>
    <div className={classes.fandomLinks}>
      {profileL.viceroyAccount ? <FandomHeader account={profileL.viceroyAccount} author={<>
        Наместник
        <Tooltip
          text={"Пользователь, который отвечает за фэндом и занимается его развитием."}
          className={classNames(classes.fandomSubs, classes.right)}
        >
          <InformationCircleIcon />
        </Tooltip>
      </>} noPadding /> : <FandomHeader
        name="Нет наместника" onClick={() => {}}
      />}
    </div>
    {!noLinks && <div className={classes.fandomLinks}>
      {infoL.links
        .map((link, idx) => <a
          href={link.url} target="_blank"
          rel="noreferrer" key={link.index}
          className={classNames(
            classes.fandomLink,
            idx > 2 && !expanded && classes.fandomHidden,
          )}
        >
          <div className={classes.fandomLinkTitle}>{link.title}</div>
          <div className={classes.fandomLinkUrl}>
            <ExternalLinkIcon />
            {link.url}
          </div>
        </a>)}
    </div>}
    <div className={!expanded ? classes.fandomHidden : undefined}>
      <div className={classNames(classes.fandomLinks, classes.fandomSecondary)}>
        <span className={classes.fandomPrimary}>Другие имена: </span>
        {infoL.names.join(", ")}
      </div>
      <div className={classNames(classes.fandomLinks, classes.fandomSecondary)}>
        <span className={classes.fandomPrimary}>Категория: </span>
        {tags[fandomL.category] || tags[101]}
      </div>
    </div>
    <ParamsTags fandomL={fandomL} infoL={infoL} expanded={expanded} params={1} />
    <ParamsTags fandomL={fandomL} infoL={infoL} expanded={expanded} params={2} />
    <ParamsTags fandomL={fandomL} infoL={infoL} expanded={expanded} params={3} />
    <IconLink className={classes.fandomExpand} onClick={() => setExpanded(x => !x)} bottom={false} right>
      {expanded ? <ChevronUpIcon /> : <ChevronDownIcon />}
      {expanded ? "Свернуть" : "Развернуть"}
    </IconLink>
  </section> : null;
}

function ParamsTags({fandomL, infoL, params, expanded}) {
  return <div className={classNames(
    !expanded && classes.fandomHidden,
    classes.fandomLinks,
  )}>
    {infoL["params" + params].map(tag => {
      const idx = toShittyIdx(`${fandomL.category}_${params}`, tag);
      const name = tags[idx];
      if (!name) return null;
      return <Tag tag={{jsonDB: {J_NAME: name, J_IMAGE_ID: 0}, parentUnitId: 0}} key={idx} noLink />;
    })}
  </div>;
}
