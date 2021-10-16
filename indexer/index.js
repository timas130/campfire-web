const ProgressBar = require("progress");
const {Worker} = require("worker_threads");

const args = process.argv;

if (args.length < 3) {
  console.log("Usage: node indexer [<start id>] [<max id>] [<threads>]");
  process.exit(1);
}

const startId = parseInt(args[2]) || 0;
const endId = parseInt(args[3]) || 100000;
const threads = parseInt(args[4]) || 1;

const bar = new ProgressBar(":id (off :offset) :bar", {total: endId});

const workers = [];
for (let thread = 0; thread < threads; thread++) {
  const worker = new Worker(__dirname + "/worker.js", {
    workerData: {thread, threads, startId, endId}
  });
  workers.push(worker);
  worker.on("message", msg => {
    bar.tick(msg.units, {
      id: msg.id,
      fandom: msg.fandom,
      offset: msg.offset
    });
  });
}
