import classes from "../../styles/Reactions.module.css";
import classNames from "classnames";
import {fetcher, useUser} from "../../lib/client-api";
import {showErrorToast} from "../../lib/ui";
import {useRouter} from "next/router";

const reactionTypes = ["🙁", "🙂", "😂", "😍", "🤔", "🤮", "🙄"];

export default function Reactions({reactions: reactionsS, setReactions, id, shown = false}) {
  const user = useUser();
  const router = useRouter();

  if (!reactionsS) return null;

  const reactions = (typeof reactionsS === "string" ?
    JSON.parse(reactionsS) : reactionsS) || [];
  const counts = [0, 0, 0, 0, 0, 0, 0];
  const you = [false, false, false, false, false, false, false];
  for (const reaction of reactions) {
    counts[reaction.reactionIndex]++;
    if (reaction.accountId === user?.J_ID) you[reaction.reactionIndex]++;
  }

  const clickReaction = (ev, idx) => {
    if (!user) {
      // noinspection JSIgnoredPromiseFromCall
      router.push("/auth/login");
      return;
    }
    fetcher(`/api/pub/${id}/react`, {
      method: "POST",
      headers: {"content-type": "application/json"},
      body: JSON.stringify({
        reaction: idx,
        set: !you[idx],
      }),
    })
      .then(() => {
        if (!you[idx]) setReactions([...reactions, {accountId: user.J_ID, reactionIndex: idx}]);
        else setReactions(reactions.filter(a => a.accountId !== user.J_ID || a.reactionIndex !== idx));
      })
      .catch(err => showErrorToast(ev.target, err));
  };

  return (shown || reactions.length > 0) && <div className={classes.reactions}>
    {reactionTypes.map((type, idx) => (
      <div className={classNames(classes.reaction, you[idx] && classes.you)}
           key={idx} tabIndex={0} onClick={ev => clickReaction(ev, idx)}>
        {type} {counts[idx]}
      </div>
    ))}
  </div>;
}
