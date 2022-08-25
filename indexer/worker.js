const {parentPort, workerData} = require("worker_threads");
const {sendRequest} = require("../lib/server");
require("dotenv").config({
  path: ".env.local",
});

async function work() {
  console.log("started worker " + workerData.thread);
  for (let i = workerData.startId + workerData.thread * 2000; i < workerData.endId; i += workerData.threads * 2000) {
    try {
      let resp;
      while (!resp) {
        try {
          const start = Date.now();
          resp = (await sendRequest("RPublicationsGetAll", {
            onlyWithFandom: false,
            accountId: 0,
            unitTypes: [9, 1],
            parentUnitId: 0,
            fandomId: 0,
            fandomsIds: [],
            appKey: null,
            appSubKey: null,
            tags: null,
            drafts: false,
            languageId: 0,
            includeZeroLanguages: false,
            includeMultilingual: true,
            includeModerationsBlocks: true,
            includeModerationsOther: true,
            important: 0,
            count: 2000,
            offset: i,
            order: 1,
            J_API_LOGIN_TOKEN: process.env.LOGIN_TOKEN,
          })).J_RESPONSE.units;
          console.log(`[${workerData.thread}] recv 2000 in ${Date.now() - start}ms`);
        } catch (e) {
          console.log("retry", e);
        }
      }
      let end = false;
      for (const unit of resp) {
        if (unit.id === 4712213) {
          end = true;
          break;
        }
      }
      parentPort.postMessage({
        units: resp.length,
        offset: i,
        id: resp[0].id,
        resp,
      });
      if (end || resp.length === 0) {
        console.log(`[${workerData.thread}] that's it! `.repeat(50));
        return;
      }
    } catch (e) {
      console.warn(e);
    }
  }
}

// noinspection JSIgnoredPromiseFromCall
work();
