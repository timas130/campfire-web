import {fetcher, useUser} from "../lib/client-api";
import useSWR from "swr";
import {BoxPlaceholder} from "./Placeholder";
import classes from "../styles/Header.module.css";
import Progress from "./controls/Progress";

const quests = [
  {
    index: 1, targets: [1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6],
    text: "Опубликуйте несколько постов.",
  },
  {
    index: 2, targets: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120],
    text: "Опубликуйте пост, который наберет большое количество кармы.",
  },
  {
    index: 3, targets: [2, 5, 8, 12, 16, 20, 24, 28, 30],
    text: "Напишите несколько комментариев.",
  },
  {
    index: 4, targets: [2, 5, 8, 12, 16, 20, 24, 28, 30],
    text: "Опубликуйте комментарий, который наберет большое количество кармы.",
  },
  {
    index: 5, targets: [10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70],
    text: "Напишите несколько сообщений в чате.",
  },
  {
    index: 6, targets: [6, 12, 18, 24, 28, 32, 36, 40, 48, 52, 58, 64],
    text: "Поставьте оценки публикациям других пользователей.",
  },
  {
    index: 7, targets: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120],
    text: "Наберите карму на любой публикации.",
  },
  {
    index: 9, targets: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2],
    text: "Опубликуйте пост в эстафете.",
  },
];

export function getQuest(id, lvl) {
  let quest;
  for (const quest1 of quests) {
    if (quest1.index === id) {
      quest = quest1;
      break;
    }
  }

  lvl = Math.floor(lvl / 100 - 1);
  const target = quest.targets.length > lvl ?
    quest.targets[lvl] :
    quest.targets[quest.targets.length - 1];
  return {
    target, text: quest.text,
  };
}

export function DailyQuest() {
  const user = useUser();
  const {data: quest, error} = useSWR("/api/user/quest", fetcher, {
    shouldRetryOnError: false,
  });

  if (error) return null;
  if (!quest || !user) {
    return <div className={classes.quest}>
      <BoxPlaceholder w="100%" h="1rem" className={classes.questTitle} />
      <BoxPlaceholder w="100%" h="1rem" />
    </div>;
  } else {
    const {target, text} = getQuest(quest.questIndex, user.J_LVL);
    const progress = quest.questFinished ? target : quest.questProgress;
    return <div className={classes.quest}>
      <div className={classes.questTitle}>
        {text} <span className={classes.questProgress}>({progress}/{target})</span>
      </div>
      <Progress value={progress} max={target} />
    </div>;
  }
}
