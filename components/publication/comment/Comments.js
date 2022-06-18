import {fetcher, useInfScroll} from "../../../lib/client-api";
import Comment from "./Comment";
import {FeedLoader} from "../../FeedLayout";
import classes from "../../../styles/Comment.module.css";
import InputLabel from "../../controls/InputLabel";
import Input from "../../controls/Input";
import {PaperClipIcon} from "@heroicons/react/solid";
import Button from "../../controls/Button";
import {showButtonToast, showErrorToast} from "../../../lib/ui";
import {useRef, useState} from "react";
import Spinner from "../../Spinner";
import classNames from "classnames";

export function CommentEditor({isLoading, submit, submitBtnRef, formRef, isReply, element, hideSelf}) {
  return <form className={classNames(classes.editor, isReply && classes.reply)}
               method="POST" onSubmit={submit} ref={formRef}>
    <InputLabel>
      {isReply ? "Ответ:" : "Комментарий:"}
      <Input
        el="textarea" className={!element && classes.input} name="content"
        placeholder={isReply ? "Текст ответа..." : "Текст комментария..."}
        onKeyDown={ev => {
          if (ev.ctrlKey && (ev.key === "Enter" || ev.keyCode === 13)) {
            submit({target: formRef.current, preventDefault() {}});
          } else if (ev.key === "Escape") {
            (typeof hideSelf === "function") && hideSelf();
          }
        }}
      />
    </InputLabel>
    <div className={classes.editorFooter}>
      <PaperClipIcon className={classes.attachmentButton} onClick={ev => {
        showButtonToast(ev.target, "В разработке ;)", null, 2000, 0);
      }} tabIndex={0} />
      <Button type="submit" className={classes.postButton} ref={submitBtnRef}>
        {isLoading && <Spinner />}
        Отправить
        <span className={classes.keyboardOnly}>(Ctrl+Enter)</span>
      </Button>
    </div>
  </form>;
}

export default function Comments({unitId, totalComments, addId, fallback, element, scrollElement}) {
  const {data: commentPages, ref, showLoader, setSize} = useInfScroll(
    `/api/post/${unitId}/comments`,
    true, null, fallback ? [fallback] : [],
  );
  const comments = commentPages.flat();
  const commentsIds = comments.map(comment => comment.id);

  const [isLoading, setIsLoading] = useState(false);
  const [postedComments, setPostedComments] = useState([]);
  const submitBtnRef = useRef();
  const formRef = useRef();

  const submitComment = ev => {
    ev.preventDefault();
    const data = new FormData(ev.target);
    const content = data.get("content");
    // noinspection JSIgnoredPromiseFromCall
    postComment(content, 0, submitBtnRef.current);
  };
  const postComment = async (content, reply = 0, buttonEl) => {
    if (isLoading) return false;
    setIsLoading(true);
    if (content.trim() === "") {
      showErrorToast(buttonEl, "Комментарий пустой");
      setIsLoading(false);
      return false;
    }

    await fetcher(`/api/pub/${unitId}/comment`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({content, reply}),
    })
      .then(resp => {
        setPostedComments(c => [...c, resp]);
        return setSize(Math.ceil(totalComments / 50) + 1);
      })
      .then(() => {
        formRef.current.reset();
        (scrollElement || window).scroll({
          top: document.documentElement.getBoundingClientRect().height,
          behavior: "smooth",
        });
      })
      .catch(err => {
        showErrorToast(submitBtnRef.current, err);
      })
      .finally(() => setIsLoading(false));
    return true;
  };

  return <div id={addId ? "comments" : null}>
    <CommentEditor submitBtnRef={submitBtnRef} formRef={formRef}
                   submit={submitComment} isLoading={isLoading}
                   element={element} />
    {comments && comments.map(comment => (
      <Comment key={comment.id} comment={comment} id={`comment-${comment.id}`}
               reply={postComment} replyLoading={isLoading} element={element} />
    ))}
    {showLoader && <FeedLoader ref={ref} />}
    {postedComments && postedComments.filter(a => !commentsIds.includes(a.id)).map(comment => (
      <Comment key={comment.id} comment={comment} id={`comment-${comment.id}`}
               reply={postComment} replyLoading={isLoading} element={element} />
    ))}
  </div>;
}
