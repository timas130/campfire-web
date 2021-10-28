import {TextFormatter} from "../components/FormattedText";

export function limitText(text, maxWords = 10, maxChars = 64, end = "…") {
  if (text.length >= maxChars - end.length) {
    return text.substr(0, 30 - end.length) + end;
  }
  let words = 0, buf = "";
  for (let i = 0; i < text.length; i++) {
    const c = text.charAt(i);
    if (TextFormatter.textChars.test(c)) words++;
    buf += c;
    if (words > maxWords) {
      return buf + end;
    }
  }
  return text;
}

const pageTypesNames = {
  1: "Текст",
  2: "Изображение",
  3: "Изображения",
  4: "Ссылка",
  5: "Цитата",
  6: "Спойлер",
  7: "Опрос",
  9: "Видео",
  10: "Таблица",
  11: "Скачиваемый ресурс",
  12: "Объект Campfire",
  13: "Эстафета",
  14: "Изображение со ссылкой",
};

/**
 * Generate a short description of the pages passed.
 * @param {({J_PAGE_TYPE: number, [p:string]: any})[]} pages J_PAGES
 * @returns {string | null} a short description of `pages`
 */
export function generateCoverForPages(pages) {
  // TODO: fix formatting

  const len = Math.min(pages.length, 3);
  if (typeof pages !== "object") {
    pages = JSON.parse(pages);
  }

  // variant 1: pages[0..2].J_SIZE == 1
  for (let i = 0; i < len; i++) {
    if (pages[i].J_PAGE_TYPE === 1 && pages[i].J_SIZE === 1) {
      return limitText(pages[i].J_TEXT);
    }
  }

  // variant 2: pages[0..2] is TextPage
  for (let i = 0; i < len; i++) {
    if (pages[i].J_PAGE_TYPE === 1) {
      return limitText(pages[i].J_TEXT);
    }
  }

  // variant 3: pages[0..2] is (QuotePage | LinkPage)
  for (let i = 0; i < len; i++) {
    if (pages[i].J_PAGE_TYPE === 5) { // quote
      return limitText(pages[i].text, 5, 32) + " — " +
        limitText(pages[i].author, 5, 32);
    } else if (pages[i].J_PAGE_TYPE === 4) { // link
      return "Ссылка на " + limitText(pages[i].name);
    }
  }

  // last option: just the type of pages[0]
  return pageTypesNames[pages[0].J_PAGE_TYPE] || null;
}
