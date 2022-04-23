import classes from "../styles/Header.module.css";
import Link from "next/link";
import {CAvatar} from "./CImage";
import {KarmaCounter} from "./Karma";
import {useUser} from "../lib/client-api";
import {useState} from "react";
import classNames from "classnames";
import {DailyQuest} from "./DailyQuest";
import {useTheme} from "../lib/theme";
import {CogIcon, LogoutIcon, MoonIcon, PencilIcon, SunIcon} from "@heroicons/react/outline";

function HeaderProfile({setMenuExpanded, full = false}) {
  const account = useUser();

  if (account) {
    const inner = <>
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
    </>;

    if (full) {
      return <Link href={`/account/${encodeURIComponent(account.J_NAME)}`}>
        <a className={classNames(classes.account, full && classes.accountFull)}>
          {inner}
        </a>
      </Link>;
    } else {
      return <div
        className={classNames(classes.account, full && classes.accountFull)}
        onClick={ev => {
          setMenuExpanded(x => !x);
          ev.stopPropagation();
        }}
        tabIndex={0}
      >
        {inner}
      </div>;
    }
  } else {
    return <Link href="/auth/login">
      <a className={classes.navLink}>Войти</a>
    </Link>;
  }
}

function MenuButton({text, onClick = null, icon = null, href = null}) {
  if (href) {
    return <Link href={href}>
      <a className={classes.navLink}>{icon} {text}</a>
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
    <MenuButton icon={<PencilIcon />} text="Черновики" href="/drafts" />
    <MenuButton icon={<CogIcon />} text="Настройки" href="/me/settings" />
    <MenuButton icon={<LogoutIcon />} text="Выйти" href="/api/auth/logout" />
  </div>;
}

function ThemeButton() {
  const {theme, setTheme} = useTheme();
  return theme === "light" ?
    <MoonIcon tabIndex={0} onClick={() => setTheme("dark")} className={classes.themeButton} /> :
    <SunIcon tabIndex={0} onClick={() => setTheme("light")} className={classes.themeButton} />;
}

export default function Header() {
  const [menuExpanded, setMenuExpanded] = useState(false);
  return <>
    <nav className={classNames(classes.header, menuExpanded && classes.expanded)}
         onClick={() => setMenuExpanded(false)}>
      <Link href="/">
        <a className={classes.h1link}>Campfire</a>
      </Link>
      <Link href="/post/search">
        <a className={classes.navLink}>Поиск</a>
      </Link>
      <div className={classes.spacer} />
      <ThemeButton />
      <HeaderProfile setMenuExpanded={setMenuExpanded} />
    </nav>
    <HeaderMenu expanded={menuExpanded} setExpanded={setMenuExpanded} />
  </>;
}
