import {modCan} from "./consts";
import useSWR from "swr";
import React, {useContext, useEffect, useState} from "react";
import BlockModal from "./BlockModal";
import Button from "../controls/Button";
import {showButtonToast} from "../../lib/ui";
import SimpleCommentModal from "./SimpleCommentModal";
import PostTagsModal from "./PostTagsModal";
import {fetcher} from "../../lib/client-api";
import {DropdownItem, DropdownSection} from "../controls/Dropdown";
import FandomPinModal from "./FandomPinModal";

export function PostModerationEntries() {
  const {data: settings} = useSWR("/api/user/settings", {
    revalidateIfStale: false,
  });
  const mod = useModeration();
  const post = mod.pub;

  if (!settings) return <DropdownSection />;

  if (settings.account.J_ID === post.creator.J_ID) {
    return <DropdownSection>
      {modCan(settings, "pin", post.fandom.id, post.fandom.languageId) &&
        <DropdownItem moderator onClick={() => mod.setTypeOpen("pin")}>
          Закрепить/открепить в фэндоме
        </DropdownItem>}
    </DropdownSection>;
  } else {
    return <DropdownSection>
      {modCan(settings, "block", post.fandom.id, post.fandom.languageId) &&
        <DropdownItem moderator onClick={() => mod.setTypeOpen("block")}>
          Заблокировать
        </DropdownItem>}
      {modCan(settings, "toDrafts", post.fandom.id, post.fandom.langaugeId) &&
        <DropdownItem moderator onClick={() => mod.setTypeOpen("toDrafts")}>
          В черновики
        </DropdownItem>}
      {modCan(settings, "toDrafts", post.fandom.id, post.fandom.langaugeId) &&
        mod.pub.fandom.languageId === -1 &&
        <DropdownItem moderator onClick={() => mod.setTypeOpen("noMultilang")}>
          Сделать не мультиязычным
        </DropdownItem>}
      {modCan(settings, "postTags", post.fandom.id, post.fandom.languageId) &&
        <DropdownItem moderator onClick={() => mod.setTypeOpen("postTags")}>
          Изменить теги
        </DropdownItem>}
      {modCan(settings, "pin", post.fandom.id, post.fandom.languageId) &&
        <DropdownItem moderator onClick={() => mod.setTypeOpen("pin")}>
          Закрепить/открепить в фэндоме
        </DropdownItem>}
    </DropdownSection>;
  }
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

export function PostModerationProvider({pub, children}) {
  const [typeOpen, setTypeOpen] = useState(null);

  return <ModerationContext.Provider value={{pub, typeOpen, setTypeOpen}}>
    <BlockModal />
    <ToDraftsModal />
    <NoMultilingualModal />
    <PostTagsModal />
    <FandomPinModal />
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
