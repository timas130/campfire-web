import React from "react";
import Post from "./post/Post";
import Comment from "./comment/Comment";
import Moderation from "./mod/Moderation";
import classes from "../../styles/Post.module.css";
import FandomHeader from "../FandomHeader";
import dynamic from "next/dynamic";

const EventUser = dynamic(() => import("./event/EventUser").then(a => a.default));

function Publication({pub, ...rest}) {
  if (pub.unitType === 9) {
    return <Post post={pub} {...rest} />;
  } else if (pub.unitType === 1) {
    return <Comment comment={pub} {...rest} />;
  } else if (pub.unitType === 11) {
    return <Moderation pub={pub} {...rest} />;
  } else if (pub.unitType === 12) {
    return <EventUser pub={pub} {...rest} />;
  } else {
    return <div className={classes.post}>
      <FandomHeader
        account={pub.creator}
        name={"Тип публикации не поддерживается"}
        author={`Абсолютно случайное число: ${pub.unitType}`}
        noLink
      />
    </div>;
  }
}

export default React.memo(Publication);
