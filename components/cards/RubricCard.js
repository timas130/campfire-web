import classes from "../../styles/Card.module.css";
import postClasses from "../../styles/Post.module.css";
import {KarmaCounter} from "../Karma";
import ShareButton from "../ShareButton";
import FandomHeader from "../FandomHeader";

export default function RubricCard({rubric}) {
  return <section className={postClasses.post}>
    <FandomHeader
      fandom={rubric.fandom} link={`/rubric/${rubric.id}`}
      name={rubric.name} authorLink={`/account/${encodeURIComponent(rubric.owner.J_NAME)}`}
      author={rubric.owner.J_NAME} addRight={<>
        <div className={classes.rubricCof}>
          <KarmaCounter value={rubric.karmaCof} isCof el="span" />
        </div>
        <ShareButton link={`/rubric/${rubric.id}`} className={classes.rubricShare} />
      </>}
    />
  </section>;
}
