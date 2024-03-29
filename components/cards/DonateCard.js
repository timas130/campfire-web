import useSWRImmutable from "swr/immutable";
import postClasses from "../../styles/Post.module.css";
import classes from "../../styles/Card.module.css";
import classNames from "classnames";
import Link from "next/link";
import Button from "../controls/Button";
import Progress from "../controls/Progress";
import {fetcher} from "../../lib/client-api";

export default function DonateCard() {
  const { data: supportInfo, error } = useSWRImmutable("/api/project/donates", fetcher);

  if (! supportInfo) return null;
  if (error) return null;

  return (
    <section className={postClasses.post}>
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
        <Link href="/donates" passHref legacyBehavior>
          <Button el="a" fullWidth className={classes.donateButton}>Пожертвовать</Button>
        </Link>
      </div>
    </section>
  );
}
