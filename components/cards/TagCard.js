import postClasses from "../../styles/Post.module.css";
import FandomHeader, {SponsorStar} from "../FandomHeader";
import Link from "next/link";
import cardClasses from "../../styles/Card.module.css";
import {ArrowLeftIcon, ViewListIcon} from "@heroicons/react/solid";
import IconLink from "../IconLink";

export default function TagCard({tag}) {
  return <section className={postClasses.post}>
    <FandomHeader
      fandom={tag.fandom}
      link={`/fandom/${tag.fandom.id}/tags/${tag.id}`}
      name={tag.jsonDB.J_NAME}
      author={<>
        Создатель тега:&nbsp;
        <Link href={`/account/${encodeURIComponent(tag.creator.J_NAME)}`}>
          <a className={postClasses.headerRubric}>{tag.creator.J_NAME}<SponsorStar account={tag.creator} /></a>
        </Link>
      </>}
      addTitle={<> <Link href={`/fandom/${tag.fandom.id}`}>
        <a className={postClasses.headerRubric}>в {tag.fandom.name}</a>
      </Link></>}
      avatarLink={`/fandom/${tag.fandom.id}`}
      imageId={tag.jsonDB.J_IMAGE_ID}
    />
    <div className={cardClasses.cardContent} style={{paddingTop: 0}}>
      <IconLink href={`/fandom/${tag.fandom.id}/tags`} right>
        <ViewListIcon />Все теги
      </IconLink>
      <IconLink href={`/fandom/${tag.fandom.id}/tags`} right>
        <ArrowLeftIcon />В фэндом {tag.fandom.name}
      </IconLink>
    </div>
  </section>;
}
