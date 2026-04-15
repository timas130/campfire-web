import postClasses from "../../styles/Post.module.css";
import classes from "../../styles/Card.module.css";
import Link from "next/link";
import {rulesConsts} from "../../pages/app/rules";
import classNames from "classnames";

export default function NoticeCard({title, className, content, children}) {
  return <section className={classNames(postClasses.post, className)}>
    <div className={classes.cardTitle}>{title}</div>
    <div className={classes.cardContent}>{content || children}</div>
  </section>;
}

export function TextFormattingCard({className}) {
  return <NoticeCard
    className={className}
    title="Форматирование текста"
    content={<>
      Текст форматируется при помощи Markdown:<br />
      <br />
      <table>
        <tbody>
          <tr><td>**текст**</td><td><b>текст</b></td></tr>
          <tr><td>*текст*</td><td><i>текст</i></td></tr>
          <tr><td>~~текст~~</td><td><s>текст</s></td></tr>
          <tr><td>`код`</td><td><code>код</code></td></tr>
          <tr><td>[текст](https://google.com)</td><td><a href="#">текст</a></td></tr>
          <tr><td># Заголовок</td><td><b>Заголовок</b></td></tr>
          <tr><td>- пункт списка</td><td>• пункт списка</td></tr>
          <tr><td>&gt; цитата</td><td><i>цитата</i></td></tr>
          <tr><td>\*текст\*</td><td>*текст*</td></tr>
        </tbody>
      </table>
    </>}
  />;
}

export function RulesCard() {
  return (
    <NoticeCard
      title={<Link href="/app/rules" target="_blank">Правила приложения</Link>}
      content={<>
        Краткий список запрещённого контента:
        <ul>
          {rulesConsts.rules.slice(0, 8).map((rule, idx) => <li key={idx}>{rule.title}</li>)}
        </ul>
      </>}
    />
  );
}
