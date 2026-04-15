import Image from "next/legacy/image";
import Link from "next/link";
import classes from "../styles/CImage.module.css";
import classNames from "classnames";
import React, {useCallback, useState} from "react";
import {isOnline} from "../lib/client-api";
import {ModalPortal} from "./Modal";
import {FocusTrap} from "@headlessui/react";

function ModalInner({className, ...props}) {
  return <div className={classNames("modal", className)} {...props} />;
}

const cdnImageLoader = ({ src, width, quality }) => (
  `${process.env.cdnUrl}/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`
);

function limitImageSize(w, h, max = 256, shrinkWidth = true) {
  const aspectRatio = w / h;
  if (w <= max && h <= max) return [w, h];

  if (w > h && shrinkWidth) {
    return [max, max / aspectRatio];
  } else {
    return [aspectRatio * max, max];
  }
}

function resolveSrc({imageRef, id}) {
  if (imageRef && imageRef.u) return imageRef.u;
  if (id) return `/api/image/${id}`;    // legacy fallback during migration
  return undefined;
}

export default function CImage(props) {
  let {w, h} = props;
  const {imageRef, id, maxSide, shrinkWidth, alt, modal, useImg, ...rest} = props;
  const [modalOpen, setModalOpen] = useState(false);

  // pull intrinsic dimensions from the ref if caller didn't pass w/h
  if ((w === undefined || h === undefined) && imageRef) {
    if (w === undefined) w = imageRef.w;
    if (h === undefined) h = imageRef.h;
  }

  if (maxSide) {
    [w, h] = limitImageSize(w, h, maxSide, shrinkWidth);
  }

  const ImageEl = useImg ? "img" : Image;
  const src = resolveSrc({imageRef, id});
  const onClick = useCallback(() => setModalOpen(x => !x), []);
  if (!src) return null;

  if (modal) {
    return <>
      <ImageEl
        src={src} alt={alt}
        loader={useImg ? undefined : cdnImageLoader}
        width={w} height={h} {...rest}
        onClick={onClick}
      />
      {modalOpen && <ModalPortal>
        <FocusTrap>
          <ModalInner
            onClick={() => setModalOpen(false)}
            tabIndex={0}
            onKeyDown={ev => ev.key === "Escape" && setModalOpen(false)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageRef?.u || `${process.env.cdnUrl}/api/image/${id}`} alt={alt} />
          </ModalInner>
        </FocusTrap>
      </ModalPortal>}
    </>;
  } else {
    return <ImageEl
      src={src} alt={alt}
      width={w} height={h} loader={useImg ? undefined : cdnImageLoader}
      {...rest}
    />;
  }
}

function _CAvatar(props) {
  let {link, id, imageRef, alt, className, account, fandom, small, el, online, ...rest} = props;
  link =
    link ? link :
    account ? `/account/${encodeURIComponent(account.J_NAME || account.name)}` :
    fandom ? `/fandom/${fandom.id}` :
    link;
  imageRef =
    imageRef ? imageRef :
    account ? account.avatar :
    fandom ? fandom.image :
    undefined;
  id =
    id ? id :
    account ? (account.J_IMAGE_ID || account.imageId) :
    fandom ? fandom.imageId :
    id;
  alt =
    alt ? alt :
    account ? (account.J_NAME || account.name) :
    fandom ? fandom.name :
    alt;
  const size = small ? 30 : 40;
  const El = el || "a";
  const inner =
    <El className={classNames(classes.avatarWrap, className, small && classes.small)}>
      <CImage
        imageRef={imageRef} id={id} w={size} h={size} alt={alt}
        className={classes.avatar}
        {...rest}
      />
      {account && (account.J_LVL || account.lvl) >= 100 && <div className={classNames(
        classes.avatarBadge,
        (account.J_LVL || account.lvl) >= 1000 && classes.long,
        (online || isOnline(account)) && classes.online,
        account.sponsorTimes > 0 && classes.sponsor,
      )}>
        {Math.floor((account.J_LVL || account.lvl) / 100)}
      </div>}
    </El>;
  if (El !== "a") {
    return inner;
  } else {
    return <Link href={link} legacyBehavior>{inner}</Link>;
  }
}

export const CAvatar = React.memo(_CAvatar);
