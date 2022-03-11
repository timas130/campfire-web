import classes from "../../../styles/Comment.module.css";
import Input from "../../controls/Input";
import InputLabel from "../../controls/InputLabel";
import Button from "../../controls/Button";
import {PaperClipIcon} from "@heroicons/react/solid";
import {useCallback, useState} from "react";
import {fetcher} from "../../../lib/client-api";

export default function CommentPoster({ pubId, addComment }) {
  const [isLoading, setIsLoading] = useState(false);
  const onSubmit = useCallback(ev => {
    if (isLoading) return;
    setIsLoading(true);
    const data = new FormData(ev.target);
    fetcher(`/api/pub/${pubId}/comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({content: data.get("content")}),
    }).then(addComment).finally(() => setIsLoading(false));
  }, [addComment, isLoading, pubId]);
  return <form className={classes.editor} method="POST"
               action={`/api/pub/${pubId}/comment?redir=true`}
               onSubmit={onSubmit}>
    <InputLabel>
      Комментарий:
      <Input
        el="textarea" className={classes.input}
        placeholder="Текст комментария..." name="content"
      />
    </InputLabel>
    <div className={classes.editorFooter}>
      <PaperClipIcon className={classes.attachmentButton} />
      <Button type="submit" className={classes.postButton}>Отправить</Button>
    </div>
  </form>;
}
