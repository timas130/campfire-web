import postClasses from "../../styles/Post.module.css";
import classes from "../../styles/Card.module.css";
import Link from "next/link";
import {rulesConsts} from "../../pages/app/rules";

export default function NoticeCard({title, content}) {
  return <section className={postClasses.post}>
    <div className={classes.cardTitle}>{title}</div>
    <div className={classes.cardContent}>{content}</div>
  </section>;
}

export function TextFormattingCard() {
  return <NoticeCard
    title="Форматирование текста"
    content={<>
      Примеры форматирования текста:<br />
      <br />
      <table>
        <tbody>
          <tr><td>*текст*</td><td><b>текст</b></td></tr>
          <tr><td>^текст^</td><td><i>текст</i></td></tr>
          <tr><td>~текст~</td><td><s>текст</s></td></tr>
          <tr><td>_текст_</td><td><u>текст</u></td></tr>
          <tr><td>[текст]https://google.com</td><td><a href="#">текст</a></td></tr>
          <tr><td>\*текст\*</td><td>*текст*</td></tr>
          <tr><td>[noFormat]*текст*[/noFormat]</td><td>*текст*</td></tr>
          <tr><td>{"{"}red текст{"}"}</td><td><span style={{color: "#D32F2F"}}>текст</span></td></tr>
          <tr><td>{"{"}campfire текст{"}"}</td><td><span style={{color: "#FF6D00"}}>текст</span></td></tr>
          <tr><td>{"{"}FF6DAA текст{"}"}</td><td><span style={{color: "#FF6DAA"}}>текст</span></td></tr>
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
