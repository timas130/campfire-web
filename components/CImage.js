import Image from "next/image";
import Link from "next/link";
import classes from "../styles/CImage.module.css";
import classNames from "classnames";

export default function CImage(props) {
  const {id, w, h, alt, ...rest} = props;
  return <Image
    src={`/api/image/${id}`} alt={alt}
    width={w} height={h} unoptimized
    {...rest}
  />;
}

export function CAvatar(props) {
  let {link, id, alt, className, account, fandom, small, el, ...rest} = props;
  link =
    account ? `/account/${account.J_NAME}` :
    fandom ? `/fandom/${fandom.id}` :
    link;
  id =
    account ? account.J_IMAGE_ID :
    fandom ? fandom.imageId :
    id;
  alt =
    account ? account.J_NAME :
    fandom ? fandom.name :
    alt;
  const size = small ? 30 : 40;
  const El = el || "a";
  const inner =
    <El className={classNames(classes.avatarWrap, className, small && classes.small)}>
      <CImage
        id={id} w={size} h={size} alt={alt}
        className={classes.avatar}
        {...rest}
      />
      {account && <div className={classNames(
        classes.avatarBadge,
        account.J_LVL >= 1000 && classes.long,
        account.J_LAST_ONLINE_DATE > Date.now() - 1000 * 60 * 15 && classes.online
      )}>
        {(account.J_LVL / 100).toFixed(0)}
      </div>}
    </El>;
  if (El !== "a") {
    return inner;
  } else {
    return <Link href={link}>{inner}</Link>;
  }
}
