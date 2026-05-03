import {fetcher} from "../lib/client-api";
import useSWR from "swr";
import {BoxPlaceholder} from "./Placeholder";
import classes from "../styles/Header.module.css";
import Progress from "./controls/Progress";

// Legacy quest table — only used for historical EventUserQuestFinish records
// that still carry a numeric questIndex. Live daily quests use GraphQL below.
const legacyQuests = [
  {index: 1, targets: [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6],
    text: "Опубликуйте несколько постов."},
  {index: 2, targets: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120],
    text: "Опубликуйте пост, который наберет большое количество кармы."},
  {index: 3, targets: [2, 5, 8, 12, 16, 20, 24, 28, 30],
    text: "Напишите несколько комментариев."},
  {index: 4, targets: [2, 5, 8, 12, 16, 20, 24, 28, 30],
    text: "Опубликуйте комментарий, который наберет большое количество кармы."},
  {index: 5, targets: [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70],
    text: "Напишите несколько сообщений в чате."},
  {index: 6, targets: [6, 12, 18, 24, 28, 32, 36, 40, 48, 52, 58, 64],
    text: "Поставьте оценки публикациям других пользователей."},
  {index: 7, targets: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120],
    text: "Наберите карму на любой публикации."},
  {index: 9, targets: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2],
    text: "Опубликуйте пост в эстафете."},
];

export function getQuest(id, lvl) {
  const quest = legacyQuests.find(q => q.index === id);
  if (!quest) return {target: 0, text: "Ежедневный квест."};
  const lvlIdx = Math.floor(lvl / 100 - 1);
  const target = quest.targets[Math.min(lvlIdx, quest.targets.length - 1)];
  return {target, text: quest.text};
}

const pageTypeNames = {
  TEXT: "текста",
  IMAGE: "изображения",
  IMAGES: "галереи",
  LINK: "ссылки",
  QUOTE: "цитаты",
  SPOILER: "спойлера",
  POLLING: "опроса",
  VIDEO: "видео",
  TABLE: "таблицы",
  DOWNLOAD: "загрузки",
  CAMPFIRE_OBJECT: "объекта Bonfire",
  USER_ACTIVITY: "эстафеты",
  LINK_IMAGE: "ссылки с изображением",
  CODE: "кода",
};

function questText(task, fandomName) {
  const fandom = fandomName ? ` в фэндоме «${fandomName}»` : "";
  switch (task?.__typename) {
    case "LoginTask":
      return "Войдите в приложение.";
    case "CreatePostsTask":
      return "Опубликуйте несколько постов.";
    case "PostInFandomTask":
      return `Опубликуйте посты${fandom}.`;
    case "CreatePostWithPageTypeTask":
      return `Опубликуйте пост со страницей ${pageTypeNames[task.pageType] || task.pageType}.`;
    case "EarnPostKarmaTask":
      return "Опубликуйте пост, который наберёт большое количество кармы.";
    case "EarnAnyKarmaTask":
      return "Наберите карму на любой публикации.";
    case "PostCommentsTask":
      return "Напишите несколько комментариев.";
    case "CommentInFandomTask":
      return `Напишите комментарии${fandom}.`;
    case "AnswerNewbieCommentTask":
      return `Ответьте на комментарии новичков (уровень ниже ${(task.maxLevel / 100).toFixed(1)}).`;
    case "CommentNewbiePostTask":
      return `Прокомментируйте посты новичков (уровень ниже ${(task.maxLevel / 100).toFixed(1)}).`;
    case "WriteMessagesTask":
      return "Напишите несколько сообщений в чате.";
    case "AnswerInChatTask":
      return "Ответьте на разные сообщения в чате.";
    case "RatePublicationsTask":
      return "Поставьте оценки публикациям других пользователей.";
    default:
      return "Ежедневный квест.";
  }
}

export function DailyQuest() {
  const {data: quest, error} = useSWR("/api/user/quest", fetcher, {
    shouldRetryOnError: false,
  });

  if (error) return null;
  if (!quest) {
    return <div className={classes.quest}>
      <BoxPlaceholder w="100%" h="1rem" className={classes.questTitle} />
      <BoxPlaceholder w="100%" h="1rem" />
    </div>;
  }

  const target = quest.task?.amount ?? 0;
  const progress = Math.min(quest.progress ?? 0, target);
  return <div className={classes.quest}>
    <div className={classes.questTitle}>
      {questText(quest.task, quest.fandomName)} <span className={classes.questProgress}>({progress}/{target})</span>
    </div>
    <Progress value={progress} max={target} />
  </div>;
}
