import Image from "next/image";
import Link from "next/link";
import classes from "../styles/CImage.module.css";
import classNames from "classnames";
import React, {useState} from "react";
import {isOnline} from "../lib/client-api";
import {ModalPortal} from "./Modal";

function ModalInner({className, ...props}) {
  return <div className={classNames("modal", className)} {...props} />;
}

const cdnImageLoader = ({ src, width, quality }) => (
  `${process.env.cdnUrl}/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`
);

export default function CImage(props) {
  const {id, w, h, alt, modal, useImg, ...rest} = props;
  const [modalOpen, setModalOpen] = useState(false);

  const ImageEl = useImg ? "img" : Image;

  if (modal) {
    return <>
      <ImageEl
        src={`/api/image/${id}`} alt={alt} loader={useImg ? undefined : cdnImageLoader}
        width={w} height={h} onClick={() => setModalOpen(x => !x)}
        {...rest}
      />
      {modalOpen && <ModalPortal><ModalInner onClick={() => setModalOpen(false)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <ImageEl src={`${process.env.cdnUrl}/api/image/${id}`} alt={alt} />
      </ModalInner></ModalPortal>}
    </>;
  } else {
    return <ImageEl
      src={`/api/image/${id}`} alt={alt}
      width={w} height={h} loader={useImg ? undefined : cdnImageLoader}
      {...rest}
    />;
  }
}

export function CAvatar(props) {
  let {link, id, alt, className, account, fandom, small, el, online, ...rest} = props;
  link =
    link ? link :
    account ? `/account/${encodeURIComponent(account.J_NAME)}` :
    fandom ? `/fandom/${fandom.id}` :
    link;
  id =
    id ? id :
    account ? account.J_IMAGE_ID :
    fandom ? fandom.imageId :
    id;
  alt =
    alt ? alt :
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
        (online || isOnline(account)) && classes.online
      )}>
        {Math.floor(account.J_LVL / 100)}
      </div>}
    </El>;
  if (El !== "a") {
    return inner;
  } else {
    return <Link href={link}>{inner}</Link>;
  }
}
