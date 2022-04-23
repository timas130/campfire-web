import {ConfirmButton, useModeration} from "./PostModeration";
import {ModalDialog, ModalPortal} from "../Modal";
import classes from "../../styles/Moderation.module.css";
import useSWRImmutable from "swr/immutable";
import {fetcher} from "../../lib/client-api";
import {useEffect, useState} from "react";
import useSWR from "swr";
import {TagSelector} from "../../pages/drafts/[id]/publish";
import {FeedLoader} from "../FeedLayout";
import Button from "../controls/Button";
import Spinner from "../Spinner";
import InputLabel from "../controls/InputLabel";
import Input from "../controls/Input";
import {ChevronDownIcon} from "@heroicons/react/solid";
import {CommentTemplateSelector} from "./CommentTemplateSelector";
import {showButtonToast, showErrorToast} from "../../lib/ui";

export default function PostTagsModal() {
  const mod = useModeration();

  const {
    data: tags,
    isValidating: loadingTags,
  } = useSWRImmutable(
    mod.typeOpen === "postTags" &&
      `/api/fandom/${mod.pub.fandom.id}/tags`,
  );
  const {
    data: {tags: initialTags} = {},
    isValidating: loadingPost,
    mutate: mutatePost,
  } = useSWR(
    mod.typeOpen === "postTags" &&
      `/api/post/${mod.pub.id}`,
  );
  const [selectedTags, setSelectedTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);

  useEffect(() => {
    if (initialTags) {
      setSelectedTags(initialTags
        .filter(a => a.parentUnitId) // no categories!
        .map(a => a.id));
    }
  }, [initialTags]);

  const submit = ev => {
    if (isLoading) return;
    setIsLoading(true);
    fetcher("/api/mod/tags", {
      method: "POST",
      headers: {"content-type": "application/json"},
      body: JSON.stringify({
        unitId: mod.pub.id,
        tags: selectedTags,
        comment,
      }),
    }).then(() => {
      showButtonToast(ev.target, "Теги изменены", null, 3000);
      mod.setTypeOpen(null);
      // noinspection JSIgnoredPromiseFromCall
      mutatePost();
    }).catch(e => {
      showErrorToast(ev.target, e);
      setIsLoading(false);
    });
  };

  return mod.typeOpen === "postTags" && <ModalPortal>
    <ModalDialog close={() => mod.setTypeOpen(null)} title="Изменить теги" scrollable>
      <CommentTemplateSelector isOpen={templateSelectorOpen} select={comment => {
        setTemplateSelectorOpen(false);
        comment && setComment(comment);
      }} />
      {(loadingTags || loadingPost) ?
        <FeedLoader /> :
        <div className={classes.tagsContent}>
          <TagSelector tags={tags} selectedTags={selectedTags}
                       setSelectedTags={setSelectedTags} />
          <InputLabel>
            Комментарий:
            <div className={classes.inputRow}>
              <Input el="textarea" value={comment} onChange={ev => setComment(ev.target.value)} autoFocus />
              <ChevronDownIcon
                tabIndex={0} onClick={() => setTemplateSelectorOpen(true)}
              />
            </div>
          </InputLabel>
          <div className={classes.bottomRow}>
            <Button onClick={() => mod.setTypeOpen(null)}>Отмена</Button>
            <ConfirmButton className={classes.submitButton} onClick={submit}>
              {isLoading && <Spinner />}
              Изменить теги
            </ConfirmButton>
          </div>
        </div>}
    </ModalDialog>
  </ModalPortal>;
}
