import classes from "../styles/Karma.module.css";
import classNames from "classnames";
import React, {useRef, useState} from "react";
import {ChevronDownIcon, ChevronUpIcon} from "@heroicons/react/solid";
import {useRouter} from "next/router";
import {fetcher, useUser} from "../lib/client-api";
import {useSWRConfig} from "swr";
import {showButtonToast} from "../lib/ui";

export function KarmaCounter(props) {
  const {value, cof, precise, el, isCof} = props;
  const El = el || "div";
  return <El className={classNames(
    classes.karmaCounter,
    isCof ?
      value > 100 ?
        classes.karmaPositive :
        value < 100 ?
          classes.karmaNegative :
          null :
      value > 0 ?
        classes.karmaPositive :
        value < 0 ?
          classes.karmaNegative :
          null,
  )}>
    {(precise || isCof) ?
      (isCof ? "x" : "") + (value / 100).toFixed(2) :
      Math.floor(value / 100)}
    {cof && cof !== 100 && <small className={classes.cof}>
      x{cof / 100}
    </small>}
  </El>;
}

export default function Karma(props) {
  const {pub, vertical, small, precise} = props;
  const account = useUser();
  const router = useRouter();
  const {mutate} = useSWRConfig();
  const [myKarmaClient, setMyKarmaClient] = useState(pub.myKarma);

  const wrapperRef = useRef();

  const setKarma = positive => {
    if (! account) {
      // noinspection JSIgnoredPromiseFromCall
      router.push("/auth/login");
    } else {
      fetcher(`/api/pub/${pub.id}/karma?positive=${positive}`)
        .then(r => {
          setMyKarmaClient(r.myKarmaCount);
          return mutate("/api/user/quest");
        })
        .catch(() => {
          showButtonToast(wrapperRef.current, "Произошла ошибка", null, 5000, -2);
        });
    }
  };

  const disabled = myKarmaClient !== 0 || (account && pub.creator.J_ID === account.J_ID);
  return <div ref={wrapperRef} className={classNames(
    classes.karma,
    vertical && classes.vertical,
    disabled && classes.karmaVoted,
    small && classes.small
  )}>
    <ChevronDownIcon
      className={classNames(
        classes.karmaButton,
        myKarmaClient < 0 && classes.karmaNegative
      )}
      onClick={() => !disabled && setKarma(false)}
      tabIndex={0}
    />
    <KarmaCounter
      value={pub.karmaCount + (pub.myKarma ? 0 : myKarmaClient || 0)}
      cof={pub.fandom.karmaCof} precise={precise}
    />
    <ChevronUpIcon
      className={classNames(
        classes.karmaButton,
        myKarmaClient > 0 && classes.karmaPositive
      )}
      onClick={() => !disabled && setKarma(true)}
      tabIndex={0}
    />
  </div>;
}
