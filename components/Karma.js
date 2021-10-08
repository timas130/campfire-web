import classes from "../styles/Karma.module.css";
import classNames from "classnames";
import React, {useState} from "react";
import {ChevronDownIcon, ChevronUpIcon} from "@heroicons/react/solid";
import {fetcher} from "../pages/_app";
import useSWRImmutable from "swr/immutable";
import {useRouter} from "next/router";

export function KarmaCounter(props) {
  const {value, cof, precise, el} = props;
  const El = el || "div";
  return <El className={classNames(
    classes.karmaCounter,
    value > 0 ? classes.karmaPositive :
      value < 0 ? classes.karmaNegative : null
  )}>
    {precise ?
      (value / 100).toFixed(2) :
      (value / 100).toFixed(0)}
    {cof && cof !== 100 && <small className={classes.cof}>
      x{cof / 100}
    </small>}
  </El>;
}

export default function Karma(props) {
  const {pubId, karmaCount, karmaCof, myKarma, vertical, small, precise} = props;
  const {data: user} = useSWRImmutable("/api/user", fetcher);
  const router = useRouter();
  const [myKarmaClient, setMyKarmaClient] = useState(myKarma);

  const setKarma = positive => {
    if (! user) {
      // noinspection JSIgnoredPromiseFromCall
      router.push("/auth/login");
    } else {
      fetcher(`/api/pub/${pubId}/karma?positive=${positive}`)
        .then(r => setMyKarmaClient(r.myKarmaCount));
    }
  };

  return <div className={classNames(
    classes.karma,
    vertical && classes.vertical,
    myKarmaClient !== 0 && classes.karmaVoted,
    small && classes.small
  )}>
    <ChevronDownIcon className={classNames(
      classes.karmaButton,
      myKarmaClient < 0 && classes.karmaNegative
    )} onClick={() => myKarmaClient === 0 && setKarma(false)} />
    <KarmaCounter
      value={karmaCount + (myKarmaClient || 0)}
      cof={karmaCof} precise={precise}
    />
    <ChevronUpIcon className={classNames(
      classes.karmaButton,
      myKarmaClient > 0 && classes.karmaPositive
    )} onClick={() => myKarmaClient === 0 && setKarma(true)} />
  </div>;
}
