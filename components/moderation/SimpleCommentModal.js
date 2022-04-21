import {ConfirmButton, useModeration} from "./PostModeration";
import {ModalDialog, ModalPortal} from "../Modal";
import {useState} from "react";
import {CommentTemplateSelector} from "./CommentTemplateSelector";
import classes from "../../styles/Moderation.module.css";
import {ChevronDownIcon} from "@heroicons/react/solid";
import InputLabel from "../controls/InputLabel";
import Input from "../controls/Input";
import Button from "../controls/Button";
import Spinner from "../Spinner";
import {showButtonToast, showErrorToast} from "../../lib/ui";

export default function SimpleCommentModal({
  type, title, action, done = "Готово",
  submit: _submit = async (_comment, _pub) => {},
}) {
  const [comment, setComment] = useState("");
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const mod = useModeration();

  const submit = ev => {
    if (isLoading) return;
    setIsLoading(true);
    _submit(comment, mod.pub)
      .then(() => {
        showButtonToast(ev.target, done);
        mod.setTypeOpen(null);
      })
      .catch(e => {
        setIsLoading(false);
        showErrorToast(ev.target, e);
      });
  };

  return mod.typeOpen === type && <ModalPortal>
    <ModalDialog close={() => mod.setTypeOpen(null)} title={title}>
      <CommentTemplateSelector isOpen={templateSelectorOpen} select={comment => {
        setTemplateSelectorOpen(false);
        comment && setComment(comment);
      }} />
      <div className={classes.content}>
        <InputLabel>
          Комментарий:
          <div className={classes.inputRow}>
            <Input el="textarea" value={comment} onChange={ev => setComment(ev.target.value)} />
            <ChevronDownIcon
              tabIndex={0} onClick={() => setTemplateSelectorOpen(true)}
            />
          </div>
        </InputLabel>
      </div>
      <div className={classes.bottomRow}>
        <Button onClick={() => mod.setTypeOpen(null)}>Отмена</Button>
        <ConfirmButton className={classes.submitButton} onClick={submit}>
          {isLoading && <Spinner />}
          {action}
        </ConfirmButton>
      </div>
    </ModalDialog>
  </ModalPortal>;
}
