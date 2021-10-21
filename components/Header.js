import classes from "../styles/Header.module.css";
import Link from "next/link";
import {CAvatar} from "./CImage";
import {KarmaCounter} from "./Karma";
import {useUser} from "../lib/client-api";

function HeaderProfile() {
  const account = useUser();
  return account ? <Link href={`/account/${encodeURIComponent(account.J_NAME)}`}>
    <a className={classes.account}>
      <CAvatar
        account={account} online
        className={classes.accountAvatar}
      />
      <div className={classes.accountText}>
        {account.J_NAME}<br />
        <span style={{fontWeight: "normal"}}>
          <KarmaCounter value={account.karma30} el="span" /> за 30 дней
        </span>
      </div>
    </a>
  </Link> : <Link href="/auth/login">
    <a className={classes.navLink}>Войти</a>
  </Link>;
}

export default function Header() {
  return <nav className={classes.header}>
    <Link href="/">
      <a className={classes.h1link}>
        <h1 className={classes.h1}>Campfire<sup className={classes.releaseCycle}>dev</sup></h1>
      </a>
    </Link>
    <Link href="/post/search">
      <a className={classes.navLink}>Поиск</a>
    </Link>
    <div className={classes.spacer} />
    <HeaderProfile />
  </nav>;
}
