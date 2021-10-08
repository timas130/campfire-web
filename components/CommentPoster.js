import classes from "../styles/Comment.module.css";
import Input from "./Input";
import InputLabel from "./InputLabel";
import Button from "./Button";
import {PaperClipIcon} from "@heroicons/react/solid";

export default function CommentPoster() {
  return <div className={classes.editor}>
    <InputLabel>
      Комментарий:
      <Input
        el="textarea" className={classes.input}
        placeholder="Текст комментария..."
      />
    </InputLabel>
    <div className={classes.editorFooter}>
      <PaperClipIcon className={classes.attachmentButton} />
      <Button className={classes.postButton}>Отправить</Button>
    </div>
  </div>;
}
