import TextPage, {TextPageEdit} from "./TextPage";
import ImagePage, {ImagePageEdit} from "./ImagePage";
import LinkPage, {LinkPageEdit} from "./LinkPage";
import QuotePage, {QuotePageEdit} from "./QuotePage";
import React, {useState} from "react";
import SpoilerPage, {SpoilerPageEdit} from "./SpoilerPage";
import ImagesPage from "./ImagesPage";
import classes from "../../../../styles/Page.module.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import NProgress from "nprogress";
import CodePage, {CodePageEdit} from "./CodePage";
import CampfireObjectPage from "./CampfireObjectPage";
import PollPage from "./PollPage";
import {CheckIcon, XIcon, TrashIcon, SelectorIcon} from "@heroicons/react/solid";
import {blobToBase64} from "../../../../lib/client-api";
import {getErrorText, showErrorToast} from "../../../../lib/ui";
import VideoPage from "./VideoPage";

const pageTypes = {
  1: TextPage,
  2: ImagePage,
  3: ImagesPage,
  4: LinkPage,
  5: QuotePage,
  6: SpoilerPage,
  7: PollPage,
  9: VideoPage,
  12: CampfireObjectPage,
  16: CodePage,
};
export const pageEditTypes = {
  1: TextPageEdit,
  2: ImagePageEdit,
  4: LinkPageEdit,
  5: QuotePageEdit,
  6: SpoilerPageEdit,
  16: CodePageEdit,
};
const pageTypesNames = {
  1: "PAGE_TYPE_TEXT",
  2: "PAGE_TYPE_IMAGE",
  3: "PAGE_TYPE_IMAGES",
  4: "PAGE_TYPE_LINK",
  5: "PAGE_TYPE_QUOTE",
  6: "PAGE_TYPE_SPOILER",
  7: "PAGE_TYPE_POLLING",
  9: "PAGE_TYPE_VIDEO",
  10: "PAGE_TYPE_TABLE",
  11: "PAGE_TYPE_DOWNLOAD",
  12: "PAGE_TYPE_CAMPFIRE_OBJECT",
  13: "PAGE_TYPE_USER_ACTIVITY",
  14: "PAGE_TYPE_LINK_IMAGE",
  16: "PAGE_TYPE_CODE",
};

export function Page(props) {
  let {page, editable, commit, isEditing: isGlobalEditing, setIsEditing: setGlobalIsEditing} = props;
  const [isEditing, setIsEditing] = useState(false);

  if (! pageTypes[page.J_PAGE_TYPE]) {
    return <TextPage page={{
      J_TEXT:
        "Oops, unimplemented! Page type: [noFormat]" +
          (pageTypesNames[page.J_PAGE_TYPE] || "unknown") +
        "[/noFormat]",
    }} />;
  } else {
    if ((isEditing || page.__new) && editable && pageEditTypes[page.J_PAGE_TYPE]) {
      return React.createElement(pageEditTypes[page.J_PAGE_TYPE], {
        page: page.__new ? null : page,
        async commit(newPage, target = null) {
          NProgress.start();
          console.group("commit");
          console.time("commit");
          console.timeLog("commit", "start [new, old]", newPage, page);

          const cleanup = () => {
            console.timeEnd("commit");
            console.groupEnd();
            setGlobalIsEditing(false);
            setIsEditing(false);
            NProgress.done();
          };

          if (page?.__new && newPage?.__delete) {
            console.timeLog("commit", "deleting new page => new = null");
            newPage = null;
          }

          if (newPage?._cweb_image) {
            newPage._cweb_image = await blobToBase64(newPage._cweb_image);
          }

          commit(newPage)
            .then(cleanup)
            .catch(e => {
              console.error(e);
              if (target) {
                showErrorToast(target, e, cleanup, 3500);
              } else {
                alert(`Ошибка: ${getErrorText(e)}`);
                cleanup();
              }
            });
        },
      });
    } else {
      return React.createElement(pageTypes[page.J_PAGE_TYPE], {
        onEdit: (pageEditTypes[page.J_PAGE_TYPE] && editable && !isGlobalEditing) ? () => {
          setIsEditing(true);
          setGlobalIsEditing(true);
        } : null,
        ...props,
      });
    }
  }
}

export function EditToolbar({children, profile}) {
  return <div className={classNames(classes.editToolbar, profile && classes.profile)}>
    {children}
  </div>;
}
export function ToolbarButton({icon, iconEl: IconEl = FontAwesomeIcon, active, sep, left, onClick}) {
  return <IconEl
    icon={IconEl ? icon : undefined}
    tabIndex={0} onClick={onClick}
    className={classNames(
      IconEl !== FontAwesomeIcon && classes.iconEl,
      active ? classes.active : "",
      sep && classes.toolbarSep,
      left && classes.toolbarLeft,
    )}
  />;
}
export function ToolbarActions({commit, page}) {
  return <>
    <ToolbarButton iconEl={SelectorIcon} left onClick={ev => commit({__move: true}, ev.target)} />
    <ToolbarButton iconEl={TrashIcon} onClick={ev => commit({__delete: true}, ev.target)} />
    <ToolbarButton iconEl={XIcon} onClick={ev => commit(null, ev.target)} />
    <ToolbarButton iconEl={CheckIcon} onClick={ev => commit(page, ev.target)} />
  </>;
}
