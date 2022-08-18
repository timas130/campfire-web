import dayjs from "dayjs";
import "dayjs/locale/ru";
import relativeTime from "dayjs/plugin/relativeTime";
import calendar from "dayjs/plugin/calendar";
import updateLocale from "dayjs/plugin/updateLocale";

dayjs.extend(relativeTime);
dayjs.extend(calendar);
dayjs.extend(updateLocale);
dayjs.locale("ru");
dayjs.updateLocale("ru", {
  calendar: {
    lastDay: "[вчера,] H:mm",
    sameDay: "[сегодня,] H:mm",
    nextDay: "[завтра,] H:mm",
    lastWeek: "[пред.] dddd[,] H:mm",
    nextWeek: "dddd[,] H:mm",
    sameElse: "DD.MM.YYYY[,] H:mm",
  },
});

export default dayjs;
