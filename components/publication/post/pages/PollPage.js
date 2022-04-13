import classes from "../../../../styles/Page.module.css";
import useSWR from "swr";
import Link from "next/link";
import {useMemo, useState} from "react";
import classNames from "classnames";
import Spinner from "../../../Spinner";
import {fetcher} from "../../../../lib/client-api";
import {CheckIcon} from "@heroicons/react/solid";

function toClass(b) {
  return b ? classes.pollAllowed : classes.pollRestricted;
}

export default function PollPage({page, additional: {postId}}) {
  const options = useMemo(() => {
    if (typeof page.options === "string") return JSON.parse(page.options);
    return page.options;
  }, [page.options]);

  const {data: {account: user} = {}} = useSWR("/api/user/settings");
  const {data: pollL, mutate} = useSWR(`/api/poll/${page.pollingId}`);

  const levelPass = user ? (user.J_LVL >= page.minLevel) : false;
  const karmaPass = user ? (user.karma30 >= page.minKarma) : false;
  const userDays = user ? ((Date.now() - user.J_DATE_CREATE) / 3600000 / 24) : 0;
  const daysPass = user ? (userDays >= (page.minDays || 0)) : false;
  const blacklistPass = user ? !(page.blacklist || []).includes(user.J_ID) : false;

  const canVote = levelPass && karmaPass && daysPass && blacklistPass;

  const poll = useMemo(() => {
    if (!pollL) return null;
    const result = [];
    const pollSorted = pollL.sort((a, b) => a.itemId - b.itemId);
    let psI = 0;
    for (let i = 0; i < options.length; i++) {
      if ((pollSorted[psI] || {}).itemId !== i) {
        result.push({itemId: i, myVote: false, count: 0});
      } else {
        result.push(pollSorted[i]);
        psI++;
      }
    }
    return result;
  }, [options.length, pollL]);

  const voted = poll ? poll.find(opt => (opt || {}).myVote) : null;
  const totalVotes = poll ? poll.reduce((pr, cur) => pr + ((cur || {}).count || 0), 0) : 0;

  const showResults = !!(voted || !canVote);

  const [loadingItem, setLoadingItem] = useState(null);
  const vote = idx => {
    if (voted) return;
    if (loadingItem !== null) return;
    console.log(poll);
    setLoadingItem(idx);
    mutate(async data => {
      await fetcher(`/api/poll/${page.pollingId}/vote`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          srcType: 1, // zeon moment: source type is not the same as publication type
          srcId: postId,
          srcSubId: 0,
          option: idx,
        }),
      });

      return data ? data.map(item => {
        if (item.itemId === idx) {
          return {
            itemId: idx,
            myVote: true,
            count: item.count + 1,
          };
        } else {
          return item;
        }
      }) : [];
    }, true)
      .finally(() => setLoadingItem(null));
  };

  return <div className={classes.activity}>
    <p className={classes.pollTitle}>{page.title}</p>
    <p>
      {page.minLevel > 100 && <span className={toClass(levelPass)}>
        Минимальный уровень: <b>{user ? user.J_LVL / 100 : "???"}/{page.minLevel / 100}</b>
        <br />
      </span>}
      {page.minKarma > 0 && <span className={toClass(karmaPass)}>
        Минимальная карма: <b>{user ? Math.floor(user.karma30 / 100) : "???"}/{page.minKarma / 100}</b>
        <br />
      </span>}
      {(page.minDays || 0) > 0 && <span className={toClass(daysPass)}>
        Минимум дней в приложении: <b>{user ? Math.floor(userDays) : "???"}/{page.minDays}</b>
        <br />
      </span>}
      {(page.blacklist || []).length > 0 && <span className={toClass(blacklistPass)}>
        Чёрный список: {page.blacklist.map((account, idx) => <span key={account.J_ID}>
          <Link
            href={`/account/${encodeURIComponent(account.J_NAME)}`} key={account.J_ID}
          >
            <a>{account.J_NAME}</a>
          </Link>
          {idx !== page.blacklist.length - 1 && ", "}
        </span>)}
        <br />
      </span>}
    </p>
    <div>
      {options.map((option, idx) => <div className={classNames(
        classes.pollOption,
        !voted && classes.pollVotable,
      )} key={idx} onClick={() => vote(idx)}>
        {poll && poll[idx] && poll[idx].myVote && <CheckIcon />}
        {showResults && <div className={classes.pollBar} style={{
          width: `${poll ? ((poll[idx] || {}).count || 0) / totalVotes * 100 : 0}%`,
        }} />}
        {loadingItem === idx && <Spinner />}
        {option}
        {showResults && <div className={classes.pollRight}>
          {poll ? Math.round(((poll[idx] || {}).count || 0) / totalVotes * 100) : 0}%
          ({poll ? (poll[idx] || {}).count || 0 : 0})
        </div>}
      </div>)}
    </div>
  </div>;
}
