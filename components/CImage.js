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
  const {link, id, alt, className, account, ...rest} = props;
  return <Link href={link || `/account/${account.J_NAME}`}>
    <a className={classNames(classes.avatarWrap, className)}>
      <CImage
        id={id || account.J_IMAGE_ID} w={40} h={40}
        alt={alt || account.J_NAME}
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
    </a>
  </Link>;
}
