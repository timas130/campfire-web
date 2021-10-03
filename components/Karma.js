import classes from "../styles/Karma.module.css";
import classNames from "classnames";
import React, {useState} from "react";
import {ChevronDownIcon, ChevronUpIcon} from "@heroicons/react/solid";

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
    {cof !== 100 && <small className={classes.cof}>
      x{cof / 100}
    </small>}
  </El>;
}

export default function Karma(props) {
  const {karmaCount, karmaCof, myKarma, vertical} = props;
  const [myKarmaClient,] = useState(myKarma);
  return <div className={classNames(
    classes.karma,
    vertical && classes.vertical,
    myKarmaClient !== 0 && classes.karmaVoted
  )}>
    <ChevronDownIcon className={classNames(
      classes.karmaButton,
      myKarma < 0 && classes.karmaNegative
    )} />
    <KarmaCounter value={karmaCount + myKarmaClient} cof={karmaCof} />
    <ChevronUpIcon className={classNames(
      classes.karmaButton,
      myKarma > 0 && classes.karmaPositive
    )} />
  </div>;
}
