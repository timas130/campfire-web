import postClasses from "../../styles/Post.module.css";
import classes from "../../styles/Card.module.css";
import classNames from "classnames";
import {ExternalLinkIcon, LockClosedIcon, UsersIcon} from "@heroicons/react/solid";
import Button from "../Button";
import Tooltip from "../Tooltip";
import useSWR from "swr/immutable";
import {fetcher} from "../../lib/client-api";
import {KarmaCounter} from "../Karma";
import FandomHeader from "../FandomHeader";

// const SUB_TYPE_IMPORTANT = -1;
// const SUB_TYPE_SUBBED = 0;
const SUB_TYPE_NONE = 1;

export default function FandomCard({ fandom, profile, info, fetchId = null, noLinks = false }) {
  const {data: fandomData} =
    useSWR(fetchId && `/api/fandom/${fetchId}`, fetcher, {
      fallbackData: fandom && {fandom, profile, info}
    });
  let {fandom: fandomL, profile: profileL, info: infoL} = fandomData || {};

  const loaded = Boolean(fandomL && profileL && infoL);

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
      {profileL.subscriptionType !== SUB_TYPE_NONE ?
        <Button fullWidth>Отписаться</Button> :
        <Button fullWidth>Подписаться</Button>}
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
