import postClasses from "../../styles/Post.module.css";
import FandomHeader from "../FandomHeader";

export default function TagCard({tag}) {
  return <section className={postClasses.post}>
    <FandomHeader
      fandom={tag.fandom} link={`/fandom/${tag.fandom.id}/tags/${tag.id}`}
      name={tag.jsonDB.J_NAME} author={tag.creator.J_NAME}
      authorLink={`/account/${encodeURIComponent(tag.creator.J_NAME)}`}
    />
  </section>;
}
