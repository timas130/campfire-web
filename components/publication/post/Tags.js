import classNames from "classnames";
import classes from "../../../styles/Tag.module.css";
import CImage from "../../CImage";
import Link from "next/link";

export function Tag({tag, noLink, selectable, selected, select}) {
  const El = (selectable || noLink) ? "span" : "a";
  const tagEl = <El
    className={classNames(
      classes.tag,
      tag.parentUnitId === 0 && classes.main,
      selectable && classes.selectable,
      selected && classes.selected,
    )}
    onClick={selectable ? select : undefined}
  >
    {tag.jsonDB.J_IMAGE_ID !== 0 && <CImage
      id={tag.jsonDB.J_IMAGE_ID} alt={tag.jsonDB.J_NAME}
      className={classes.tagImage}
      w={30} h={30}
    />}
    <span className={classes.tagText}>{tag.jsonDB.J_NAME}</span>
  </El>;

  if (selectable || noLink) {
    return tagEl;
  } else {
    return (
      <Link href={`/fandom/${tag.fandom.id}/tags/${tag.id}`} legacyBehavior>
        {tagEl}
      </Link>
    );
  }
}

export default function Tags({tags, className}) {
  // no legacy code, Zeon?
  tags = tags.map(tag => {
    if (typeof tag.jsonDB === "string") {
      tag.jsonDB = JSON.parse(tag.jsonDB);
    }
    return tag;
  });

  return <div className={classNames(classes.tags, className)}>
    {tags.filter(tag => !tag.parentUnitId).map(parentTag => <span key={parentTag.id}>
      <Tag tag={parentTag} />
      {tags.filter(tag => tag.parentUnitId === parentTag.id)
        .map(tag => <Tag key={tag.id} tag={tag} />)}
    </span>)}
  </div>;
}
