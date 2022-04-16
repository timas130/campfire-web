import CImage from "../../../CImage";
import classes from "../../../../styles/Page.module.css";
import React, {useMemo, useRef, useState} from "react";
import classNames from "classnames";
import Input from "../../../controls/Input";
import {EditToolbar, ToolbarActions} from "./Page";
import {UploadIcon} from "@heroicons/react/outline";
import isTouchDevice from "is-touch-device";

export default function ImagePage({ page, onEdit = null }) {
  return <div className={classNames(classes.imagePage, onEdit && classes.editable)}>
    <CImage
      id={page["J_IMAGE_ID"]}
      w={page["J_W"]} h={page["J_H"]}
      loading="lazy" modal={!onEdit}
      // you're welcome blind people
      alt="Изображение"
      onClick={onEdit}
    />
  </div>;
}

export function ImagePageEdit({page: initialPage, commit: _commit}) {
  const [page, setPage] = useState(initialPage || {
    J_PAGE_TYPE: 2,
    J_IMAGE_ID: 0,
    J_W: 0,
    J_H: 0,
    gifId: 0,
    _cweb_image: null,
  });
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const touchDevice = useMemo(isTouchDevice, []);

  const setImage = blob => {
    setPage({
      J_PAGE_TYPE: 2,
      J_IMAGE_ID: 0, gifId: 0,
      J_W: 0, J_H: 0,
      _cweb_image: blob,
    });
  };
  const chooseImage = ev => {
    if (ev.target.files.length < 1) {
      setImage(null);
      return;
    }
    setImage(ev.target.files[0]);
  };
  const handleDrop = ev => {
    ev.preventDefault();
    ev.stopPropagation();
    // TODO: image upload through urls
    const files = ev.dataTransfer.files;
    setImage(files[0]);
    setIsDragOver(false);
  };
  const commit = page => {
    if (page !== null && !page.__delete && !page.__move && !page._cweb_image) {
      _commit(null);
    } else {
      _commit(page);
    }
  };

  const hasImage = page._cweb_image || page.J_IMAGE_ID;

  return <div className={classNames(classes.imagePage, classes.editing)}>
    <Input
      ref={fileInputRef}
      style={{display: "none"}} onChange={chooseImage}
      type="file" accept="image/png, image/jpeg, image/webp"
    />
    <div className={classNames(
      classes.imagePageEditWrap,
      isDragOver && classes.dragOver,
    )}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {hasImage ? <img
        src={
          page._cweb_image instanceof Blob ? URL.createObjectURL(page._cweb_image) :
          (typeof page.J_IMAGE_ID === "number" && page.J_IMAGE_ID > 0) ? `/api/image/${page.J_IMAGE_ID}` :
          undefined
        }
        alt={"Изображение"}
        className={classes.imagePageEditImage}
      /> : <div className={classes.imagePageEditPlaceholder} />}
      <div
        className={classes.imagePageEditDropOverlay}
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={() => setIsDragOver(true)}
        onDragLeave={() => setIsDragOver(false)}
        onDragOver={ev => ev.preventDefault()}
        onDrop={handleDrop}
      />
      <div className={classes.imagePageEditOverlay}>
        <UploadIcon />
        {isDragOver ? "Можно отпускать" :
          touchDevice ?
            "Нажмите, чтобы загрузить картинку" :
            "Нажмите или переместите картинку"}
      </div>
    </div>
    <EditToolbar>
      <ToolbarActions page={page} commit={commit} />
    </EditToolbar>
  </div>;
}
