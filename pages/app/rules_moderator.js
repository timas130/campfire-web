import Head from "next/head";
import classes from "../../styles/Rules.module.css";
import MetaTags from "../../components/MetaTags";

export const modRulesConsts = {
  info: "Пожалуйста, прочтите все правила для модераторов, чтобы использовать свои привилегии на благо " +
    "сообщества. При нарушении правил модерации, аккаунт будет заблокирован на длительный срок и возможно " +
    "лишен права модерировать приложение в будущем. Администраторы могут видеть удаленные публикации и " +
    "принять меры, если модератор нарушил правила.",
  rules: [
    {
      title: "Не будьте слишком строгими",
      rule: "Не будьте слишком строгими. Помните что у нас не тоталитарный режим, не удаляйте публикации и " +
        "не блокируйте пользователей за каждую мелочь.",
    },
    {
      title: "Не используйте привилегии по своей прихоти",
      rule: "Нельзя использовать привилегии модератора без причины или по личным желаниям модератора. " +
        "Например нельзя удалять публикации за то что модератору не нравится изображенный на ней персонаж.",
    },
    {
      title: "Пишите названия фэндомов на английском",
      rule: "При изменении и разрешении фэндома, помните, что фэндом существует на нескольких языках, не " +
        "используйте никакие языки на картинках и имени, кроме английского, чтобы не навредить сообществу " +
        "на другом языке.",
    },
    {
      title: "Пишите ясные и развернутые комментарии",
      rule: "Пишите ясные и развернутые комментарии. Важно чтобы пользователи понимали по каким причинам " +
        "была заблокирована публикация, удален тег и т.д.",
    },
    {
      title: "Пишите административные комментарии на английском",
      rule: "При редактировании и отклонении фэндома обязательно писать комментарий на английском. Если вы " +
        "напишите комментарий на другом языке, то огромная часть пользователей не сможет его прочитать.",
    },
    {
      title: "Важные публикации должны быть важными",
      rule: "Помечать публикации как важные можно только если это действительно важная публикация и о " +
        "ней нужно узнать всем, кто интересуется фэндомом. Пример: новости от разработчиков игры. Важными " +
        "публикациями не являются пользовательские арты, гайды, картинки и т.п.",
    },
    {
      title: "Добавляйте только основные ссылки в фэндом",
      rule: "Добавляйте только основные ссылки в фэндом. Такими ссылками считаются официальный сайт, вики-" +
        "страница, Twitter, форум, Discord и подобное. Запрещено добавлять ссылки, не общие для фэндома, такие " +
        "как пользовательский канал на YouTube или Twitch, сторонние сервера и подобное. Также строго запрещено " +
        "добавлять ссылки на пиратский контент.",
    },
    {
      title: "Добавляйте релевантные доп. имена",
      rule: "В дополнительные имена фэндома можно добавлять только реальные названия фэндома, которые могут " +
        "быть использованы для поиска, например для фэндома Campfire — CF, Camp, Camp fire.",
    },
  ],
};

export default function ModeratorRules() {
  return <main className="container">
    <Head>
      <title>Правила модерации Campfire</title>
      <MetaTags
        title="Правила модерации Campfire"
        description={modRulesConsts.info}
        url="https://campfire.moe/app/rules_moderator"
      />
    </Head>
    <header className={classes.rulesHeader}>
      {modRulesConsts.info}
    </header>
    {modRulesConsts.rules.map((rule, idx) => <section key={idx} className={classes.rule}>
      <h2>{idx + 1}. {rule.title}</h2>
      <p className={classes.ruleContent}>{rule.rule}</p>
    </section>)}
  </main>;
}

