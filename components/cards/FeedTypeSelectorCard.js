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

export default function FeedTypeSelectorCard({type: currentType, setType, types = {
  subscribed: "Подписки",
  all: "Всё",
  best: "Лучшее",
  all_subs: "Всё с подписками",
}, className}) {
  return <div className={classNames(postClasses.post, classes.feedTypeSelector, className)}>
    {Object.keys(types).map(type => (
      <FeedTypeSelectorItem text={types[type]} value={type} key={type}
                            type={currentType} setType={setType} />
    ))}
  </div>;
}
