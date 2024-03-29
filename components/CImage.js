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

export default function CImage(props) {
  let {w, h} = props;
  const {id, maxSide, shrinkWidth, alt, modal, useImg, ...rest} = props;
  const [modalOpen, setModalOpen] = useState(false);

  if (maxSide) {
    [w, h] = limitImageSize(w, h, maxSide, shrinkWidth);
  }

  const ImageEl = useImg ? "img" : Image;

  const onClick = useCallback(() => setModalOpen(x => !x), []);

  if (modal) {
    return <>
      <ImageEl
        src={`/api/image/${id}`} alt={alt}
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
            <img src={`${process.env.cdnUrl}/api/image/${id}`} alt={alt} />
          </ModalInner>
        </FocusTrap>
      </ModalPortal>}
    </>;
  } else {
    return <ImageEl
      src={`/api/image/${id}`} alt={alt}
      width={w} height={h} loader={useImg ? undefined : cdnImageLoader}
      {...rest}
    />;
  }
}

function _CAvatar(props) {
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
      {account && account.J_LVL >= 100 && <div className={classNames(
        classes.avatarBadge,
        account.J_LVL >= 1000 && classes.long,
        (online || isOnline(account)) && classes.online,
        account.sponsorTimes > 0 && classes.sponsor,
      )}>
        {Math.floor(account.J_LVL / 100)}
      </div>}
    </El>;
  if (El !== "a") {
    return inner;
  } else {
    return <Link href={link} legacyBehavior>{inner}</Link>;
  }
}

export const CAvatar = React.memo(_CAvatar);
