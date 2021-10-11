import classes from "../../../../styles/Page.module.css";
import classNames from "classnames";

export default function QuotePage({ page }) {
  const author = page.author;
  const text = page.text;
  return <div className={classes.linkPage}>
    <figure className={classNames(classes.linkText, classes.quoteText)}>
      {author && <figcaption className={classes.linkName}>
        {author + ":"}
      </figcaption>}
      <blockquote>
        {text}
      </blockquote>
    </figure>
  </div>;
}
