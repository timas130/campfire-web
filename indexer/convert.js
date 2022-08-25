const fs = require("fs");
require("dotenv").config({path: ".env.local"});

let posts = fs.readFileSync("./result.2024.log", {encoding: "utf8"})
  .split("\n")
  .flatMap(a => a.length > 0 ? JSON.parse(a) : []);

function createContent(pages) {
  let result = "";
  for (const page of pages) {
    switch (page.J_PAGE_TYPE) {
      case 1:
        result += page.J_TEXT.trim() + "\n\n";
        break;
      case 4:
        result += "[" + page.name.trim() + "] " + page.link.trim() + "\n\n";
        break;
      case 5:
        result += page.text.trim() + " — " + page.author.trim() + "\n\n";
        break;
      case 6:
        result += "Спойлер / Spoiler: " + page.name.trim() + "\n\n";
        break;
      case 7:
        result += "Голосование " + page.title.trim() + "\n";
        for (const optionKey in page.options) {
          result += (parseInt(optionKey) + 1) + ". " + page.options[optionKey].trim() + "\n";
        }
        result += "\n\n";
        break;
      case 9:
        result += "https://youtu.be/" + page.videoId + "\n\n";
        break;
      case 10:
        result += page.title.trim() + "\n";
        for (let cell of page.cells) {
          cell = typeof cell === "string" ? JSON.parse(cell) : cell;
          result += cell.text.trim() + "\n";
        }
        result += "\n\n";
        break;
      case 14:
        result += page.link.trim() + "\n\n";
        break;
      default:
        break;
    }
  }
  return result.trim();
}

posts = posts
  .map(a => a.unitType === 9 ? {
    "activity-name": a.userActivity?.name ?? "",
    "content": createContent(a.jsonDB.J_PAGES),
    "creator-name": a.creator.J_NAME,
    "fandom-name": a.fandom.name,
    "rubric-name": a.rubricName ?? "",
    "id": a.id,
    "creator-id": a.creator.J_ID,
    "fandom-id": a.fandom.id,
    "rubric-id": a.rubricId,
    "activity-id": a.userActivity?.id ?? 0,
    "created": a.dateCreate,
    "language": a.languageId,
    "closed": a.closed,
    "comment-count": a.subUnitsCount,
    "raw_data": JSON.stringify(a),
  } : {
    "content": a.jsonDB.J_TEXT,
    "creator-name": a.creator.J_NAME,
    "fandom-name": a.fandom.name,
    "id": a.id,
    "creator-id": a.creator.J_ID,
    "fandom-id": a.fandom.id,
    "created": a.dateCreate,
    "language": a.languageId,
    "closed": a.closed,
    "raw_data": JSON.stringify(a),
  });

fs.writeFileSync("./result.2023.p.log", JSON.stringify(posts));
