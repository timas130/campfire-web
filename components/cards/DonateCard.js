import useSWR from "swr/immutable";
import postClasses from "../../styles/Post.module.css";
import classes from "../../styles/Card.module.css";
import classNames from "classnames";
import Link from "next/link";
import Button from "../Button";
import Progress from "../Progress";
import {fetcher} from "../../lib/client-api";

export default function DonateCard() {
  const { data: supportInfo, error } = useSWR("/api/project/donates", fetcher);

  if (! supportInfo) return null;
  if (error) return null;

  return <section className={postClasses.post}>
    <header className={classes.cardTitle}>
      Поддержать Campfire
    </header>
    <div className={classNames(classes.cardContent)}>
      <Progress value={supportInfo.totalCount / 100} max={1500} />
      <div className={classes.donatesSubtitle}>
        <span className={classes.donatesCollected}>
          {(supportInfo.totalCount / 100).toFixed(2)} ₽
        </span> / 1500 ₽ собрано
      </div>
      <Link href="/donates" passHref>
        <Button el="a" fullWidth className={classes.donateButton}>Пожертвовать</Button>
      </Link>
    </div>
  </section>;
}
