import postClasses from "../../styles/Post.module.css";
import classes from "../../styles/Card.module.css";
import classNames from "classnames";
import {CAvatar} from "../CImage";
import {ExternalLinkIcon, LockClosedIcon, UsersIcon} from "@heroicons/react/solid";
import Button from "../Button";
import Tooltip from "../Tooltip";

// const SUB_TYPE_IMPORTANT = -1;
// const SUB_TYPE_SUBBED = 0;
const SUB_TYPE_NONE = 1;

export default function FandomCard({ fandom, profile, info }) {
  return <section className={classNames(postClasses.post, classes.cardContent)}>
    <header className={classes.fandomHeader}>
      <CAvatar fandom={fandom} />
      <div className={classes.fandomText}>
        <h2>
          {fandom.name}
        </h2>
        <div className={classes.fandomSubtitle}>
          <UsersIcon />
          {fandom.subscribesCount}
        </div>
      </div>
      {fandom.closed && <Tooltip text="Этот фэндом закрыт"><LockClosedIcon
        className={classes.fandomIcon}
      /></Tooltip>}
    </header>
    <div className={classes.fandomButtons}>
      {profile.subscriptionType !== SUB_TYPE_NONE ?
        <Button fullWidth>Отписаться</Button> :
        <Button fullWidth>Подписаться</Button>}
    </div>
    <div className={classes.fandomDescription}>
      {info.description}
    </div>
    <div className={classes.fandomLinks}>
      {info.links.map(link => <a href={link.url} target="_blank" rel="noreferrer"
                                 key={link.index} className={classes.fandomLink}>
        <div className={classes.fandomLinkTitle}>{link.title}</div>
        <div className={classes.fandomLinkUrl}>
          <ExternalLinkIcon />
          {link.url}
        </div>
      </a>)}
    </div>
  </section>;
}
