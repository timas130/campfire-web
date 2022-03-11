import postClasses from "../../styles/Post.module.css";
import classes from "../../styles/Profile.module.css";
import classNames from "classnames";
import {CAvatar} from "../CImage";
import {isOnline, useUser} from "../../lib/client-api";
import moment from "moment";
import "moment/locale/ru";
import {
  CalendarIcon,
  ClockIcon,
  EmojiHappyIcon,
  ExclamationIcon,
  LightningBoltIcon,
  PencilIcon,
  StarIcon,
  UserCircleIcon,
  UsersIcon,
} from "@heroicons/react/solid";
import {KarmaCounter} from "../Karma";
import {useEffect, useRef, useState} from "react";
import Input from "../controls/Input";
import {EditToolbar, ToolbarButton} from "../publication/post/pages/Page";
import {faCheck} from "@fortawesome/free-solid-svg-icons/faCheck";
import {faTimes} from "@fortawesome/free-solid-svg-icons/faTimes";
import {useSWRConfig} from "swr";

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
export function ProfileKV({icon, keyS, value, upd = null, edit = null, editSelect = null}) {
  const Icon = icon;
  const [isEditing, setIsEditing] = useState(false);
  const [override, setOverride] = useState(null);
  const formRef = useRef();

  const editCb = ev => {
    ev.preventDefault();
    let value = new FormData(formRef.current).get("value");
    if (!editSelect) value = parseInt(value);
    setOverride(value);
    setIsEditing(false);
    edit(value);
  };

  useEffect(() => {
    setOverride(value);
  }, [value, upd]);

  return <div className={classes.profileKV}>
    <div className={classes.profileKey}>
      <Icon className={classes.profileKeyIcon} />
      {keyS}
    </div>
    {!isEditing ? <div className={classes.profileValue}>
      {override || value}
      {edit && <PencilIcon
        className={classes.profileEditIcon}
        onClick={() => setIsEditing(true)}
        tabIndex={0}
      />}
    </div> : <form className={classes.profileValue} onSubmit={editCb} ref={formRef}>
      {!editSelect ?
        <Input className={classes.profileEditInput} name="value" autoFocus type="number" /> :
        <Input className={classes.profileEditInput} name="value" autoFocus el="select">
          {/* yes this is bad, who cares? */}
          {editSelect.map(item => <option value={item} key={item}>{item}</option>)}
        </Input>}
      <EditToolbar profile>
        <ToolbarButton icon={faCheck} onClick={editCb} />
        <ToolbarButton icon={faTimes} onClick={() => setIsEditing(false)} />
      </EditToolbar>
    </form>}
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
      break;
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
  const {mutate} = useSWRConfig();
  const user = useUser() || {};
  const [upd, setUpd] = useState(null);

  return <div className={classNames(postClasses.post, postClasses.mb05, classes.profile)}>
    <div className={classes.profileRow}>
      <ProfileShort account={account} />
      <SponsorChip account={account} />
    </div>
    {profile.banDate > Date.now() ? <div className={classNames(classes.profileRow, classes.bans)}>
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
        upd={upd}
        edit={user.J_ID === account.J_ID ? value => {
          fetch("/api/user/edit", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({prop: "age", value: parseInt(value)}),
          })
            .catch(() => setUpd(Date.now()))
            .then(resp => {
              if (!resp.ok) setUpd(Date.now());
              else mutate(`/api/account/${account.J_ID}`, {account, profile: {
                ...profile,
                age: value,
              }});
            });
        } : null}
      />
      <ProfileKV
        icon={EmojiHappyIcon} keyS="Обращение"
        value={account.sex ? "Она" : "Он"}
        upd={upd}
        editSelect={["Он", "Она"]}
        edit={user.J_ID === account.J_ID ? value => {
          const sex = value === "Она" ? 1 : 0;
          fetch("/api/user/edit", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({prop: "sex", value: sex}),
          })
            .catch(() => setUpd(Date.now())) // todo: actually show the error
            .then(resp => {
              if (!resp.ok) setUpd(Date.now());
              else mutate(`/api/account/${account.J_ID}`, {account, profile: {...profile, sex}});
            });
        } : null}
      />
      <ProfileKV
        icon={CalendarIcon} keyS="Возраст аккаунта"
        value={moment(profile.dateCreate).locale("ru").fromNow(true)}
      />
    </div>
  </div>;
}
