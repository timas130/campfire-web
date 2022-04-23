import {ConfirmButton, useModeration} from "./PostModeration";
import {ModalDialog, ModalPortal} from "../Modal";
import useSWR from "swr";
import {FeedLoader} from "../FeedLayout";
import {CommentTemplateSelector} from "./CommentTemplateSelector";
import classes from "../../styles/Moderation.module.css";
import InputLabel from "../controls/InputLabel";
import Input from "../controls/Input";
import {ChevronDownIcon} from "@heroicons/react/solid";
import Button from "../controls/Button";
import Spinner from "../Spinner";
import {useState} from "react";
import {showButtonToast, showErrorToast} from "../../lib/ui";
import {fetcher} from "../../lib/client-api";

export default function FandomPinModal() {
  const mod = useModeration();
  const [comment, setComment] = useState("");
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);
  const {data: pinnedPost, isValidating: isLoadingPinned} = useSWR(
    mod.typeOpen === "pin" &&
    `/api/fandom/${mod.pub.fandom.id}/pinned?lang=${mod.pub.fandom.languageId}`
  );
  const [isLoading, setIsLoading] = useState(false);

  const isUnpin = pinnedPost?.id === mod.pub.id;

  const submit = ev => {
    if (isLoading) return;
    setIsLoading(true);
    const postId = isUnpin ? 0 : mod.pub.id;
    fetcher("/api/mod/pin", {
      method: "POST",
      headers: {"content-type": "application/json"},
      body: JSON.stringify({
        postId,
        fandomId: mod.pub.fandom.id,
        languageId: mod.pub.fandom.languageId,
        comment,
      }),
    })
      .then(() => {
        showButtonToast(ev.target, isUnpin ? "Откреплено" : "Закреплено");
        mod.setTypeOpen(null);
      })
      .catch(err => {
        showErrorToast(ev.target, err);
        setIsLoading(false);
      });
  };
  
  return mod.typeOpen === "pin" && <ModalPortal>
    <ModalDialog close={() => mod.setTypeOpen(null)} title={isUnpin ? "Открепить" : "Закрепить"}>
      <CommentTemplateSelector isOpen={templateSelectorOpen} select={comment => {
        setTemplateSelectorOpen(false);
        comment && setComment(comment);
      }} />
      {!isLoadingPinned ? <>
        <div className={classes.content}>
          <InputLabel>
            Комментарий:
            <div className={classes.inputRow}>
              <Input el="textarea" value={comment} onChange={ev => setComment(ev.target.value)} autoFocus />
              <ChevronDownIcon tabIndex={0} onClick={() => setTemplateSelectorOpen(true)} />
            </div>
          </InputLabel>
        </div>
        <div className={classes.bottomRow}>
          <Button onClick={() => mod.setTypeOpen(null)}>Отмена</Button>
          <ConfirmButton className={classes.submitButton} onClick={submit}>
            {isLoading && <Spinner />} {isUnpin ? "Открепить" : "Закрепить"}
          </ConfirmButton>
        </div>
      </> : <FeedLoader />}
    </ModalDialog>
  </ModalPortal>;
}
