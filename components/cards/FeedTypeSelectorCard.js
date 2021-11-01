import postClasses from "../../styles/Post.module.css";
import classes from "../../styles/Card.module.css";
import classNames from "classnames";

function FeedTypeSelectorItem({text, value, type, setType}) {
  return <div
    className={classNames(classes.feedTypeSelectorItem, type === value && classes.selected)}
    onClick={() => setType(value)}
  >
    {text}
  </div>;
}

export default function FeedTypeSelectorCard({type, setType}) {
  return <div className={classNames(postClasses.post, classes.feedTypeSelector)}>
    <FeedTypeSelectorItem text="Подписки" value="subscribed" type={type} setType={setType} />
    <FeedTypeSelectorItem text="Всё" value="all" type={type} setType={setType} />
    <FeedTypeSelectorItem text="Лучшее" value="best" type={type} setType={setType} />
    <FeedTypeSelectorItem text="Всё с подписками" value="all_subs" type={type} setType={setType} />
  </div>;
}
