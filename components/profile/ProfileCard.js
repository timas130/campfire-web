import postClasses from "../../styles/Post.module.css";
import classes from "../../styles/Profile.module.css";
import classNames from "classnames";
import {CAvatar} from "../CImage";
import {isOnline} from "../../lib/client-api";
import moment from "moment";
import "moment/locale/ru";
import {
  CalendarIcon,
  ClockIcon,
  EmojiHappyIcon,
  ExclamationIcon,
  LightningBoltIcon,
  StarIcon,
  UserCircleIcon,
  UsersIcon
} from "@heroicons/react/solid";
import {KarmaCounter} from "../Karma";

export function ProfileShort({account}) {
  return <div className={classes.accountShort}>
    <CAvatar account={account} />
    <div className={classes.text}>
      <div className={classes.nickname}>{account.J_NAME}</div>
      <div className={isOnline(account) ? classes.online : classes.onlineDate}>
        {isOnline(account) ?
          "Онлайн" :
          ("Был онлайн " + moment(account.J_LAST_ONLINE_DATE)
            .locale("ru").fromNow())}
      </div>
    </div>
  </div>;
}
export function SponsorChip({account}) {
  return account.sponsor ? <div className={classes.sponsorChip}>
    Спонсор {account.sponsor / 100} ₽
  </div> : null;
}
export function ProfileKV({icon, keyS, value}) {
  const Icon = icon;
  return <div className={classes.profileKV}>
    <div className={classes.profileKey}>
      <Icon className={classes.profileKeyIcon} />
      {keyS}
    </div>
    <div className={classes.profileValue}>
      {value}
    </div>
  </div>;
}
export function Level({lvl}) {
  const ranks = [
    {lvl: 100, rank: "user"},
    {lvl: 400, rank: "mod"},
    {lvl: 700, rank: "admin"},
    {lvl: 5000, rank: "proto"},
  ];
  let rank;
  for (const ranksKey in ranks) {
    if (lvl < ranks[ranksKey].lvl) {
      rank = ranks[ranksKey - 1].rank || "user";
    }
  }

  return <span className={classNames(classes.rank, classes[rank])}>
    {(lvl / 100).toFixed(2)}
  </span>;
}
export function Punishments({bans, warns}) {
  const bansLastDigit = parseInt(bans.toString().slice(-1));
  const bansTitle =
    (bans === 0 ||
    (bans >= 5 && bans <= 20) ||
    (bansLastDigit >= 5 && bansLastDigit <= 9)) ?
    "банов" :
    (bans === 1 ||
    bansLastDigit === 1) ?
    "бан" :
    "бана";
  return <span>
    <span className={classNames(warns > 0 && classes.warns)}>
      {warns} предупр.
    </span> /&nbsp;
    <span className={classNames(bans > 0 && classes.bans)}>
      {bans} {bansTitle}
    </span>
  </span>;
}

export default function ProfileCard({account, profile}) {
  return <div className={classNames(postClasses.post, classes.profile)}>
    <div className={classes.profileRow}>
      <ProfileShort account={account} />
      <SponsorChip account={account} />
    </div>
    {profile.banDate ? <div className={classNames(classes.profileRow, classes.bans)}>
      Аккаунт заблокирован до {moment(profile.banDate).locale("ru").calendar()}
    </div> : null}
    <div className={classes.profileRow}>
      <ProfileKV
        icon={StarIcon} keyS="Карма"
        value={<KarmaCounter value={profile.karmaTotal} precise el="span" />}
      />
      <ProfileKV
        icon={CalendarIcon} keyS="Карма за 30 дней"
        value={<KarmaCounter value={account.karma30} precise el="span" />}
      />
      <ProfileKV
        icon={LightningBoltIcon} keyS="Уровень"
        value={<Level lvl={account.J_LVL} />}
      />
      <ProfileKV
        icon={ExclamationIcon} keyS="Наказания"
        value={<Punishments bans={profile.bansCount} warns={profile.warnsCount} />}
      />
      <ProfileKV
        icon={UsersIcon} keyS="Подписчики"
        value={profile.followersCount}
      />
      <ProfileKV
        icon={UserCircleIcon} keyS="Подписки"
        value={profile.followsCount}
      />
      <ProfileKV
        icon={ClockIcon} keyS="Возраст"
        value={profile.age || "Не указано"}
      />
      <ProfileKV
        icon={EmojiHappyIcon} keyS="Обращение"
        value={account.sex ? "Она" : "Он"}
      />
    </div>
  </div>;
}
