import classes from "../../styles/Card.module.css";
import postClasses from "../../styles/Post.module.css";
import {fetcher} from "../../lib/client-api";
import useSWR from "swr";
import {DailyQuest} from "../DailyQuest";

export default function DailyQuestCard() {
  const {error} = useSWR("/api/user/quest", fetcher, {
    shouldRetryOnError: false,
  });

  if (error) return null;
  return <div className={postClasses.post}>
    <div className={classes.cardTitle}>Ежедневный квест</div>
    <div className={classes.cardContent}><DailyQuest /></div>
  </div>;
}
