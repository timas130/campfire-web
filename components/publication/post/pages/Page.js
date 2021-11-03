import TextPage, {TextPageEdit} from "./TextPage";
import ImagePage from "./ImagePage";
import LinkPage, {LinkPageEdit} from "./LinkPage";
import QuotePage, {QuotePageEdit} from "./QuotePage";
import React, {useState} from "react";
import SpoilerPage, {SpoilerPageEdit} from "./SpoilerPage";
import ImagesPage from "./ImagesPage";
import classes from "../../../../styles/Page.module.css";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import classNames from "classnames";
import {faCheck, faTrash, faWindowClose} from "@fortawesome/free-solid-svg-icons";
import NProgress from "nprogress";

const pageTypes = {
  1: TextPage,
  2: ImagePage,
  3: ImagesPage,
  4: LinkPage,
  5: QuotePage,
  6: SpoilerPage
};
export const pageEditTypes = {
  1: TextPageEdit,
  4: LinkPageEdit,
  5: QuotePageEdit,
  6: SpoilerPageEdit,
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
};

export function Page(props) {
  let {page, editable, commit, isEditing: isGlobalEditing, setIsEditing: setGlobalIsEditing} = props;
  const [isEditing, setIsEditing] = useState(false);

  if (! pageTypes[page.J_PAGE_TYPE]) {
    return <TextPage page={{
      J_TEXT:
        "Oops, unimplemented! Page type: [noFormat]" +
          (pageTypesNames[page.J_PAGE_TYPE] || "unknown") +
        "[/noFormat]"
    }} />;
  } else {
    if ((isEditing || page.__new) && editable && pageEditTypes[page.J_PAGE_TYPE]) {
      return React.createElement(pageEditTypes[page.J_PAGE_TYPE], {
        page: page.__new ? null : page,
        commit(newPage) {
          NProgress.start();
          console.group("commit");
          console.time("commit");
          console.timeLog("commit", "start [new, old]", newPage, page);
          commit(newPage)
            .catch(e => {
              console.error(e);
              if (typeof e === "object" && e.code && e.messageError) {
                alert(`Ошибка: [${e.code}] ${e.messageError}`);
              } else {
                alert("Ошибка: " + JSON.stringify(e));
              }
            })
            .finally(() => {
              console.timeEnd("commit");
              console.groupEnd();
              setGlobalIsEditing(false);
              setIsEditing(false);
            })
            .finally(() => {
              NProgress.done();
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

export function EditToolbar({children}) {
  return <div className={classes.editToolbar}>
    {children}
  </div>;
}
export function ToolbarButton({icon, active, sep, left, onClick}) {
  return <FontAwesomeIcon
    icon={icon} tabIndex={0} onClick={onClick}
    className={classNames(
      active ? classes.active : "",
      sep && classes.toolbarSep,
      left && classes.toolbarLeft,
    )}
  />;
}
export function ToolbarActions({commit, page}) {
  return <>
    <ToolbarButton icon={faTrash} left onClick={() => commit({__delete: true})} />
    <ToolbarButton icon={faWindowClose} onClick={() => commit(null)} />
    <ToolbarButton icon={faCheck} onClick={() => commit(page)} />
  </>;
}
