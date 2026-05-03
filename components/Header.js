import classes from "../styles/Header.module.css";
import Link from "next/link";
import {CAvatar} from "./CImage";
import {KarmaCounter} from "./Karma";
import {useUser} from "../lib/client-api";
import classNames from "classnames";
import {DailyQuest} from "./DailyQuest";
import {useTheme} from "../lib/theme";
import {BanknotesIcon, Cog6ToothIcon, ArrowRightOnRectangleIcon, MoonIcon, PencilIcon, SunIcon, Squares2X2Icon} from "@heroicons/react/24/outline";
import {Popover, Transition} from "@headlessui/react";
import classesDropdown from "../styles/Dropdown.module.css";
import {SponsorStar} from "./FandomHeader";
import useSWR from "swr";
import React from "react";
import Button from "./controls/Button";

const HeaderProfile = React.forwardRef(function _HeaderProfile({full = false}, ref) {
  const account = useUser();
  const accountF = useSWR(account && "/api/user/settings").data?.account;

  if (account) {
    const inner = <>
      <CAvatar
        account={account} online el="div"
        className={classes.accountAvatar}
      />
      <div className={classes.accountText}>
        {account.J_NAME}<SponsorStar account={accountF} showTimes={full} /><br />
        <span style={{fontWeight: "normal"}}>
          <KarmaCounter value={account.karma30} el="span" /> за 30 дней
        </span>
      </div>
    </>;

    if (full) {
      return (
        <Popover.Button className={classes.buttonReset}>
          <Link
            href={`/account/${encodeURIComponent(account.J_NAME)}`}
            className={classNames(classes.account, classes.accountFull)}
            ref={ref}>

            {inner}

          </Link>
        </Popover.Button>
      );
    } else {
      return <Popover.Button
        className={classNames(classes.buttonReset, classes.account)}
        tabIndex={0}
      >
        {inner}
      </Popover.Button>;
    }
  } else {
    return (
      <Link href="/auth/login" passHref legacyBehavior>
        <Button el="a">Войти</Button>
      </Link>
    );
  }
});

const MenuButton = React.forwardRef(function _MenuButton({text, icon = null, href, onClick}, ref) {
  return (
    <Popover.Button className={classNames(classes.buttonReset, classes.navLink)}>
      {href ? <Link href={href} onClick={onClick} className={classes.navLink} ref={ref}>
        {icon} {text}
      </Link> : <div className={classes.navLink} ref={ref} onClick={onClick}>{icon} {text}</div>}
    </Popover.Button>
  );
});

function MenuDivider() {
  return <div className={classes.menuDivider} />;
}

function HeaderMenu() {
  return <div className={classNames(classes.menu)}>
    <HeaderProfile full />
    <DailyQuest />
    <MenuButton icon={<Squares2X2Icon />} text="Фэндомы" href="/fandom" />
    <MenuButton icon={<BanknotesIcon />} text="Пожертвования" href="/donates" />
    <MenuDivider />
    <MenuButton icon={<PencilIcon />} text="Черновики" href="/drafts" />
    <MenuButton icon={<Cog6ToothIcon />} text="Настройки" href="/me/settings" />
    <MenuButton icon={<ArrowRightOnRectangleIcon />} text="Выйти" onClick={() => {
      fetch("/api/auth/logout", {method: "POST"}).finally(() => {
        window.location = "/";
      });
    }} />
  </div>;
}

function ThemeButton() {
  const {theme, setTheme} = useTheme();
  return theme === "light" ?
    <MoonIcon tabIndex={0} onClick={() => setTheme("dark")} className={classes.themeButton} /> :
    <SunIcon tabIndex={0} onClick={() => setTheme("light")} className={classes.themeButton} />;
}

export default function Header() {
  return <>
    <nav className={classNames(classes.header)}>
      <Link href="/" className={classes.h1link}>
        Bonfire
      </Link>
      <Link href="/post/search" className={classes.navLink}>
        Поиск
      </Link>
      <div className={classes.spacer} />
      <ThemeButton />
      <Popover className={classes.popoverRoot}>
        <HeaderProfile />
        <Popover.Overlay className={classes.overlay} />
        <Transition
          className={classes.transitionRoot}
          enter={classesDropdown.transitionEnter}
          enterFrom={classesDropdown.transitionEnterFrom}
          enterTo={classesDropdown.transitionEnterTo}
          leave={classesDropdown.transitionLeave}
          leaveFrom={classesDropdown.transitionLeaveFrom}
          leaveTo={classesDropdown.transitionLeaveTo}
        >
          <Popover.Panel>
            <HeaderMenu />
          </Popover.Panel>
        </Transition>
      </Popover>
    </nav>
  </>;
}
