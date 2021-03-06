import Image from "next/image";
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

export default function CImage(props) {
  const {id, w, h, alt, modal, useImg, ...rest} = props;
  const [modalOpen, setModalOpen] = useState(false);

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
      {account && <div className={classNames(
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
    return <Link href={link}>{inner}</Link>;
  }
}

export const CAvatar = React.memo(_CAvatar);
