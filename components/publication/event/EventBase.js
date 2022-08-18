import classes from "../../../styles/Post.module.css";
import FandomHeader from "../../FandomHeader";
import dayjs from "../../../lib/time";

export default function EventBase({pub, icon, account, title, subtitle}) {
  return <article className={classes.post}>
    <div className={classes.eventTop}>
      {dayjs(pub.dateCreate).calendar()}
    </div>
    <FandomHeader
      alignStart
      account={account}
      imageId={icon}
      name={title}
      author={subtitle}
      allowOverflow={0b11}
      noLink
    />
  </article>;
}
