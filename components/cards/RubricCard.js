import classes from "../../styles/Card.module.css";
import postClasses from "../../styles/Post.module.css";
import {CAvatar} from "../CImage";
import Link from "next/link";
import {KarmaCounter} from "../Karma";
import ShareButton from "../ShareButton";

export default function RubricCard({rubric}) {
  return <section className={postClasses.post}>
    <header className={postClasses.header}>
      <CAvatar fandom={rubric.fandom} />
      <div className={postClasses.headerText}>
        <div className={postClasses.headerTitle}>
          <Link href={`/rubric/${rubric.id}`}>
            <a className={postClasses.headerFandom}>
              {rubric.name}
            </a>
          </Link>
        </div>
        <div className={postClasses.headerSecondary}>
          <Link href={`/account/${encodeURIComponent(rubric.owner.J_NAME)}`}>
            <a className={postClasses.headerAuthor}>
              {rubric.owner.J_NAME}
            </a>
          </Link>
        </div>
      </div>
      <div className={classes.rubricCof}>
        <KarmaCounter value={rubric.karmaCof} isCof el="span" />
      </div>
      <ShareButton link={`/rubric/${rubric.id}`} className={classes.rubricShare} />
    </header>
  </section>;
}
