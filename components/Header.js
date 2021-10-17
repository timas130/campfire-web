import classes from "../styles/Header.module.css";
import Link from "next/link";
import {CAvatar} from "./CImage";
import {KarmaCounter} from "./Karma";
import {useUser} from "../lib/client-api";

function HeaderProfile() {
  const account = useUser();
  return account ? <div className={classes.account}>
    <CAvatar
      account={account}
      className={classes.accountAvatar}
    />
    <div>
      {account.J_NAME}<br />
      <span style={{fontWeight: "normal"}}>
        <KarmaCounter value={account.karma30} el="span" /> за 30 дней
      </span>
    </div>
  </div> : <Link href="/auth/login">
    <a className={classes.navLink}>Войти</a>
  </Link>;
}

export default function Header() {
  return <nav className={classes.header}>
    <Link href="/">
      <a className={classes.h1link}>
        <h1 className={classes.h1}>Campfire</h1>
      </a>
    </Link>
    <Link href="/post/search">
      <a className={classes.navLink}>Поиск</a>
    </Link>
    <div className={classes.spacer} />
    <HeaderProfile />
  </nav>;
}
