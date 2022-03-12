import classes from "../styles/Karma.module.css";
import classNames from "classnames";
import React, {useRef, useState} from "react";
import {ChevronDownIcon, ChevronUpIcon} from "@heroicons/react/solid";
import {useRouter} from "next/router";
import {fetcher, useUser} from "../lib/client-api";
import useSWR, {useSWRConfig} from "swr";
import {showErrorToast} from "../lib/ui";
import Spinner from "./Spinner";

export function KarmaCounter(props) {
  const {value, cof, precise, el, isCof, mr} = props;
  const El = el || "div";
  return <El className={classNames(
    classes.karmaCounter,
    mr && classes.mr,
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
  const {pub, vertical, small, precise, mr} = props;
  const account = useUser();
  const {data: {settings: {anonRates = false} = {}} = {}} = useSWR(account && "/api/user/settings");
  const router = useRouter();
  const {mutate} = useSWRConfig();
  const [myKarmaClient, setMyKarmaClient] = useState(pub.myKarma);
  const [loadingDirection, setLoadingDirection] = useState(null);

  const wrapperRef = useRef();

  const setKarma = positive => {
    if (loadingDirection) return;
    if (! account) {
      // noinspection JSIgnoredPromiseFromCall
      router.push("/auth/login");
    } else {
      setLoadingDirection(positive ? "up" : "down");
      fetcher(`/api/pub/${pub.id}/karma?positive=${positive}&anon=${anonRates}`, {method: "POST"})
        .then(r => {
          setMyKarmaClient(r.myKarmaCount);
          setLoadingDirection(null);
          return mutate("/api/user/quest", quest => {
            if (quest.questIndex === 6) {
              quest.questProgress++;
            }
            return quest;
          }, true);
        })
        .catch(err => {
          showErrorToast(wrapperRef.current, err, null, 5000, -2);
          setLoadingDirection(null);
          // not using finally because we also wait for /api/user/quest here
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
    {loadingDirection !== "down" ? <ChevronDownIcon
      className={classNames(
        classes.karmaButton,
        myKarmaClient < 0 && classes.karmaNegative
      )}
      onClick={() => !disabled && setKarma(false)}
      tabIndex={0}
    /> : <Spinner className={classNames(classes.karmaButton, classes.loading, classes.karmaNegative)} />}
    <KarmaCounter
      value={pub.karmaCount + (pub.myKarma ? 0 : myKarmaClient || 0)}
      cof={pub.fandom.karmaCof} precise={precise} mr={mr}
    />
    {loadingDirection !== "up" ? <ChevronUpIcon
      className={classNames(
        classes.karmaButton,
        myKarmaClient > 0 && classes.karmaPositive
      )}
      onClick={() => !disabled && setKarma(true)}
      tabIndex={0}
    /> : <Spinner className={classNames(classes.karmaButton, classes.loading, classes.karmaPositive)} />}
  </div>;
}
