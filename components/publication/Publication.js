import React from "react";
import Post from "./post/Post";
import Comment from "./comment/Comment";
import Moderation from "./mod/Moderation";
import classes from "../../styles/Post.module.css";

function Publication({pub, ...rest}) {
  if (pub.unitType === 9) {
    return <Post post={pub} {...rest} />;
  } else if (pub.unitType === 1) {
    return <Comment comment={pub} {...rest} />;
  } else if (pub.unitType === 11) {
    return <Moderation pub={pub} {...rest} />;
  } else {
    return <div className={classes.post}>
      Тип публикации не поддерживается.
    </div>;
  }
}

export default React.memo(Publication);
