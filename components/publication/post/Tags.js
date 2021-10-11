import classNames from "classnames";
import classes from "../../../styles/Tag.module.css";
import CImage from "../../CImage";
import Link from "next/link";

export function Tag({tag}) {
  return <Link href={`/fandom/${tag.fandom.id}/tags/${tag.id}`}>
    <a className={classNames(classes.tag, tag.parentUnitId === 0 && classes.main)}>
      {tag.jsonDB.J_IMAGE_ID !== 0 && <CImage
        id={tag.jsonDB.J_IMAGE_ID} alt={tag.jsonDB.J_NAME}
        className={classes.tagImage}
        w={30} h={30}
      />}
      <span className={classes.tagText}>{tag.jsonDB.J_NAME}</span>
    </a>
  </Link>;
}

export default function Tags({tags}) {
  // no legacy code, Zeon?
  tags = tags.map(tag => {
    if (typeof tag.jsonDB === "string") {
      tag.jsonDB = JSON.parse(tag.jsonDB);
    }
    return tag;
  });

  return <div className={classes.tags}>
    {tags.filter(tag => !tag.parentUnitId).map(parentTag => <>
      <Tag tag={parentTag} />
      {tags.filter(tag => tag.parentUnitId === parentTag.id)
        .map(tag => <Tag key={tag.id} tag={tag} />)}
    </>)}
  </div>;
}
