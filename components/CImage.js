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

function limitImageSize(w, h, max = 256, shrinkWidth = true) {
  const aspectRatio = w / h;
  if (w <= max && h <= max) return [w, h];

  if (w > h && shrinkWidth) {
    return [max, max / aspectRatio];
  } else {
    return [aspectRatio * max, max];
  }
}

export default function CImage(props) {
  let {w, h} = props;
  // `id` is accepted-but-ignored: legacy callsites still pass numeric image
  // ids alongside imageRef. The /api/image/{id} proxy is gone — only imageRef.u
  // is used. Destructure to keep the prop from leaking to the DOM as an attr.
  const {imageRef, id: _id, maxSide, shrinkWidth, alt, modal, useImg, ...rest} = props;
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
  const src = imageRef?.u;
  const onClick = useCallback(() => setModalOpen(x => !x), []);
  if (!src) return null;

  if (modal) {
    return <>
      <ImageEl
        src={src} alt={alt}
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
            <img src={src} alt={alt} />
          </ModalInner>
        </FocusTrap>
      </ModalPortal>}
    </>;
  } else {
    return <ImageEl
      src={src} alt={alt}
      width={w} height={h}
      {...rest}
    />;
  }
}

function _CAvatar(props) {
  let {link, imageRef, alt, className, account, fandom, small, el, online, ...rest} = props;
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
        imageRef={imageRef} w={size} h={size} alt={alt}
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
