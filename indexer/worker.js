const {parentPort, workerData} = require("worker_threads");
const {sendRequest} = require("../lib/server");
const {post} = require("axios");
require("dotenv").config({
  path: ".env.local"
});

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
        result += page.title.trim() + "\n";
        for (const optionKey in page.options) {
          result += (optionKey + 1) + ". " + page.options[optionKey].trim() + "\n";
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

async function work() {
  for (let i = workerData.startId + workerData.thread * 20; i < workerData.endId; i += workerData.threads * 20) {
    try {
      let resp;
      while (!resp) {
        try {resp = (await sendRequest("RPublicationsGetAll", {
          accountId: 0,
          parentUnitId: 0,
          offset: i,
          fandomId: 0,
          fandomsIds: [],
          important: 0,
          drafts: false,
          includeZeroLanguages: false,
          includeModerationsBlocks: false,
          includeModerationsOther: false,
          includeMultilingual: true,
          unitTypes: [9],
          order: 1,
          languageId: 0,
          onlyWithFandom: false,
          count: 20,
          appKey: "",
          appSubKey: "",
          tags: [],
          J_API_LOGIN_TOKEN: process.env.LOGIN_TOKEN
        })).J_RESPONSE.units;} catch (e) {console.log("retry", e);}
      }
      const docs = [];
      for (const unit of resp) {
        if (unit.fandom.id === 2776) continue;
        const doc = {};
        doc["id"] = unit.id;
        doc["creator-id"] = unit.creator.J_ID;
        doc["fandom-id"] = unit.fandom.id;
        doc["fandom-name"] = unit.fandom.name;
        doc["rubric-id"] = unit.rubricId;
        doc["rubric-name"] = unit.rubricName;
        doc["activity-id"] = (unit.userActivity || {id: 0}).id;
        doc["activity-name"] = (unit.userActivity || {name: ""}).name;
        doc["created"] = unit.dateCreate;
        doc["language"] = unit.languageId;
        doc["closed"] = unit.closed;
        doc["comment-count"] = unit.subUnitsCount;
        const jsonDB = typeof unit.jsonDB === "string" ? JSON.parse(unit.jsonDB) : unit.jsonDB;
        const pages = typeof jsonDB.J_PAGES === "string" ? JSON.parse(jsonDB.J_PAGES) : jsonDB.J_PAGES;
        doc["content"] = createContent(pages);
        doc["tags"] = []; // TODO: tags in indexer (somehow)
        doc["raw_data"] = JSON.stringify(unit);
        docs.push(doc);
      }
      if (docs.length === 0) {
        parentPort.postMessage({
          units: resp.length,
          errors: false,
          id: 0,
          fandom: "<skip>",
          offset: i
        });
        continue;
      }
      const result = (await post(
        workerData.elasticRoot + "/posts-v1/_bulk",
        docs.map(doc => '{"index":{"_id": "' + doc.id + '"}}\n' + JSON.stringify(doc) + "\n").join(""),
        {
          headers: {
            "content-type": "application/x-ndjson",
            "accept": "application/json"
          }
        }
      )).data;
      parentPort.postMessage({
        units: result.items.length,
        errors: result.errors,
        id: docs[0].id,
        fandom: docs[0]["fandom-name"],
        offset: i
      });
    } catch (e) {
      console.warn(e);
    }
  }
}

// noinspection JSIgnoredPromiseFromCall
work();
