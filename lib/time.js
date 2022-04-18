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
    lastDay: "[вчера в] H:mm",
    sameDay: "[сегодня в] H:mm",
    nextDay: "[завтра в] H:mm",
    lastWeek: "[пред.] dddd[,] H:mm",
    nextWeek: "dddd[,] H:mm",
    sameElse: "DD.MM.YYYY",
  },
});

export default dayjs;
