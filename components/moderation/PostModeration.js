import {modCan} from "./consts";
import useSWR from "swr";
import React, {useContext, useEffect, useMemo, useState} from "react";
import classes from "../../styles/Dropdown.module.css";
import BlockModal from "./BlockModal";
import Button from "../controls/Button";
import {showButtonToast} from "../../lib/ui";
import SimpleCommentModal from "./SimpleCommentModal";
import PostTagsModal from "./PostTagsModal";
import {fetcher} from "../../lib/client-api";

export function usePostModerationEntries({post}) {
  const {data: settings} = useSWR("/api/user/settings");
  const mod = useModeration();

  return useMemo(() => {
    if (!settings) return [];

    const actions = [
      modCan(settings, "block", post.fandom.id, post.fandom.languageId) && {
        id: "block", label: "Заблокировать",
        className: classes.moderator,
        onClick: () => {
          mod.setTypeOpen("block");
        },
      },
      modCan(settings, "toDrafts", post.fandom.id, post.fandom.langaugeId) && {
        id: "toDrafts", label: "В черновики",
        className: classes.moderator,
        onClick: () => {
          mod.setTypeOpen("toDrafts");
        },
      },
      // this is not a mistake - toDrafts and noMultilang require the same level
      modCan(settings, "toDrafts", post.fandom.id, post.fandom.langaugeId) &&
      mod.pub.fandom.languageId === -1 && {
        id: "noMultilang", label: "Сделать не мультиязычным",
        className: classes.moderator,
        onClick: () => {
          mod.setTypeOpen("noMultilang");
        },
      },
      modCan(settings, "postTags", post.fandom.id, post.fandom.languageId) && {
        id: "postTags", label: "Изменить теги",
        className: classes.moderator,
        onClick: () => {
          mod.setTypeOpen("postTags");
        },
      },
      modCan(settings, "pin", post.fandom.id, post.fandom.languageId) && {
        id: "pin", className: classes.moderator,
        // FIXME: for some reason this sends two requests
        loading: () => fetcher(
          `/api/fandom/${post.fandom.id}/pinned?lang=${post.fandom.languageId}`
        ).then(pinnedPost => {
          if (pinnedPost?.id === post.id) {
            return {label: "Открепить", onClick: () => mod.setTypeOpen("unpin")};
          } else {
            return {label: "Закрепить", onClick: () => mod.setTypeOpen("pin")};
          }
        }),
      },
    ];

    if (actions.find(a => a)) return [{ type: "separator" }, ...actions];
    else return [];
  }, [settings, mod, post]);
}

const ModerationContext = React.createContext({
  pub: {},
  typeOpen: null,
  setTypeOpen: (_type) => {},
});

export const useModeration = () => useContext(ModerationContext);

const ToDraftsModal = () => <SimpleCommentModal
  type="toDrafts"
  title="В черновики"
  action="В черновики"
  submit={(comment, pub) => {
    return fetcher("/api/mod/to_drafts", {
      method: "POST",
      headers: {"content-type": "application/json"},
      body: JSON.stringify({
        unitId: pub.id,
        comment,
      }),
    });
  }}
/>;
const NoMultilingualModal = () => <SimpleCommentModal
  type="noMultilang"
  title="Убрать мультиязычность"
  action="Убрать"
  submit={(comment, pub) => {
    return fetcher("/api/mod/no_multilang", {
      method: "POST",
      headers: {"content-type": "application/json"},
      body: JSON.stringify({
        unitId: pub.id,
        comment,
      }),
    });
  }}
/>;
const FandomPinModal = () => <SimpleCommentModal
  type="pin"
  title="Закрепить в фэндоме"
  action="Закрепить"
  done="Закреплено"
  submit={(comment, pub) => {
    return fetcher("/api/mod/pin", {
      method: "POST",
      headers: {"content-type": "application/json"},
      body: JSON.stringify({
        postId: pub.id,
        fandomId: pub.fandom.id,
        languageId: pub.fandom.languageId,
        comment,
      }),
    });
  }}
/>;
const FandomUnpinModal = () => <SimpleCommentModal
  type="unpin"
  title="Открепить в фэндоме"
  action="Открепить"
  done="Откреплено"
  submit={(comment, pub) => {
    return fetcher("/api/mod/pin", {
      method: "POST",
      headers: {"content-type": "application/json"},
      body: JSON.stringify({
        postId: 0,
        fandomId: pub.fandom.id,
        languageId: pub.fandom.languageId,
        comment,
      }),
    });
  }}
/>;

export function PostModerationProvider({pub, children}) {
  const [typeOpen, setTypeOpen] = useState(null);

  return <ModerationContext.Provider value={{pub, typeOpen, setTypeOpen}}>
    <BlockModal />
    <ToDraftsModal />
    <NoMultilingualModal />
    <PostTagsModal />
    <FandomPinModal />
    <FandomUnpinModal />
    {children}
  </ModerationContext.Provider>;
}

// -- helpers --
export function ConfirmButton({onClick, ...rest}) {
  const [clickedOnce, setClickedOnce] = useState(false);

  useEffect(() => {
    if (clickedOnce) {
      const id = setTimeout(() => setClickedOnce(false), 4000);
      return () => clearTimeout(id);
    }
  }, [clickedOnce]);

  return <Button onClick={ev => {
    if (clickedOnce) {
      onClick(ev);
    } else {
      showButtonToast(ev.target, "Ещё раз для подтверждения");
      setClickedOnce(true);
    }
  }} {...rest} />;
}
