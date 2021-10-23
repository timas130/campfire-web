import classes from "../styles/Header.module.css";
import Link from "next/link";
import {CAvatar} from "./CImage";
import {KarmaCounter} from "./Karma";
import {useUser} from "../lib/client-api";
import {useState} from "react";
import classNames from "classnames";
import {useRouter} from "next/router";
import {DailyQuest} from "./DailyQuest";

function HeaderProfile({setMenuExpanded, full = false}) {
  const account = useUser();
  const router = useRouter();
  return account ? <div
    className={classNames(classes.account, full && classes.accountFull)}
    onClick={() => {
      if (full) {
        // noinspection JSIgnoredPromiseFromCall
        router.push(`/account/${encodeURIComponent(account.J_NAME)}`);
      } else {
        setMenuExpanded(x => !x);
      }
    }}
    tabIndex={full ? 0 : null}
  >
    <CAvatar
      account={account} online el="div"
      className={classes.accountAvatar}
    />
    <div className={classes.accountText}>
      {account.J_NAME}<br />
      <span style={{fontWeight: "normal"}}>
        <KarmaCounter value={account.karma30} el="span" /> за 30 дней
      </span>
    </div>
  </div> : <Link href="/auth/login">
    <a className={classes.navLink}>Войти</a>
  </Link>;
}

function MenuButton({text, onClick = null, href = null}) {
  if (href) {
    return <Link href={href}>
      <a className={classes.navLink}>{text}</a>
    </Link>;
  } else {
    return <div className={classes.navLink} onClick={onClick}>{text}</div>;
  }
}
function HeaderMenu({expanded, setExpanded}) {
  return <div className={classNames(classes.menu, expanded && classes.expanded)}
              onClick={() => setExpanded(false)}>
    <HeaderProfile full />
    <DailyQuest />
    <MenuButton text="Выйти" href="/api/auth/logout" />
  </div>;
}

export default function Header() {
  const [menuExpanded, setMenuExpanded] = useState(false);
  return <>
    <nav className={classes.header}>
      <Link href="/">
        <a className={classes.h1link}>
          <h1 className={classes.h1}>Campfire<sup className={classes.releaseCycle}>dev</sup></h1>
        </a>
      </Link>
      <Link href="/post/search">
        <a className={classes.navLink}>Поиск</a>
      </Link>
      <div className={classes.spacer} />
      <HeaderProfile setMenuExpanded={setMenuExpanded} />
    </nav>
    <HeaderMenu expanded={menuExpanded} setExpanded={setMenuExpanded} />
  </>;
}
