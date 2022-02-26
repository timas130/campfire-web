import postClasses from "../../../styles/Post.module.css";
import classes from "../../../styles/Post.module.css";
import {FandomHeaderPlaceholder} from "../../FandomHeader";
import classNames from "classnames";
import {BoxPlaceholder, TextPlaceholder} from "../../Placeholder";
import React from "react";

function PostPlaceholder(_props, ref) {
  return <div className={postClasses.post} ref={ref}>
    <FandomHeaderPlaceholder />
    <div className={classNames(postClasses.content, postClasses.expanded, postClasses.padded)}>
      <TextPlaceholder />
      <TextPlaceholder mb={6} />
      <BoxPlaceholder h={400} />
    </div>
    <div className={classes.footer}>
      <div className={classes.expander}>
        <BoxPlaceholder w={20} h={20} mr={6} />
        <TextPlaceholder ww={85} h={20} />
      </div>
      <div className={classes.spacer} />
      <TextPlaceholder ww={100} />
    </div>
  </div>;
}

export default React.forwardRef(PostPlaceholder);
