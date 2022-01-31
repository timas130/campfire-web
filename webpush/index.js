const {sendRequest} = require("../lib/server");
const fastify = require("fastify")({ logger: true });
fastify.register(require("fastify-websocket"), {
  errorHandler: (err, conn) => {
    conn.end("unknown error");
  },
});
const genUUID = require("uuid").v4;
const {sign, verify} = require("jsonwebtoken");
require("dotenv").config({
  path: ".env.local",
});
const rawBody = require("raw-body");
const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL);

const selfUrl = "https://push.33rd.dev/push";

function register() {
  const uuid = genUUID();
  const sendToken = sign({
    "sub": uuid,
  }, process.env.JWT_SECRET, {
    "audience": "pushrelay-send",
  });
  return {
    uuid,
    listenToken: sign({
      "sub": uuid,
    }, process.env.JWT_SECRET, {
      "audience": "pushrelay-listen",
    }),
    sendToken,
    registrationToken: `custom|${selfUrl}|${sendToken}`,
    websocket: null,
  };
}

fastify.addContentTypeParser("application/octet-stream", (req, payload, done) => {
  rawBody(payload, {
    length: req.headers["content-length"],
    limit: "2mb",
  }, (err, body) => {
    done(err, body);
  });
});

fastify.get("/", async () => {
  return "PushRelay™ server";
});

fastify.route({
  method: ["GET", "POST"],
  url: "/register",
  schema: {
    querystring: {
      campfire: { type: "boolean" },
    },
  },
  async handler(req) {
    const reg = register();

    if (req.query.campfire !== false) {
      const response = (await sendRequest("RAccountsAddNotificationsToken", {
        token: reg.registrationToken,
        J_API_LOGIN_TOKEN: req.body.loginToken,
      }));
      if (response.J_STATUS !== "J_STATUS_OK") {
        throw "error adding notifications token to campfire";
      }
    }

    redis.set(reg.uuid, (req.body || {}).loginToken || "<none>", "ex", 60);

    return {listenToken: reg.listenToken, sendToken: reg.sendToken};
  },
});

fastify.post("/push", async (req, res) => {
  const results = [];
  for (const token of (req.body.registration_ids || [req.body.to])) {
    let uuid;
    try {
      uuid = verify(token, process.env.JWT_SECRET, {
        "audience": "pushrelay-send",
      }).sub;
    } catch (e) {
      results.push({message_id: "cweb", error: "NotRegistered"});
      continue;
    }

    const reg = await redis.get(uuid);
    if (reg === null) {
      results.push({message_id: "cweb", error: "NotRegistered"});
      continue;
    }

    await redis.publish(uuid, JSON.stringify(req.body.data));

    results.push({message_id: "cweb"});
  }

  res.status(200);
  return {results};
});

fastify.get("/stream", {websocket: true}, async (conn, req) => {
  const authToken = req.headers.authorization || req.headers["sec-websocket-protocol"];
  const uuid = verify(authToken, process.env.JWT_SECRET, {
    "audience": "pushrelay-listen",
  }).sub;

  const reg = await redis.get(uuid);
  if (reg === null) {
    conn.end("registration is not valid");
    return;
  }

  await redis.set(uuid, reg); // do not expire

  const keepAliveInterval = setInterval(() => {
    conn.write(JSON.stringify({_: "keep-alive"}));
  }, 10000);

  const redisSub = new Redis(process.env.REDIS_URL);
  conn.socket.on("close", () => {
    clearInterval(keepAliveInterval);
    redis.expire(uuid, 30);
    redisSub.disconnect();
  });
  redisSub.subscribe(uuid, (err) => {
    if (err) {
      fastify.log.warn(err);
      conn.end("could not start listening, please try again");
      redisSub.disconnect();
    }
  });
  redisSub.on("message", (channel, message) => {
    conn.write(message);
  });
});

fastify.listen(3001, "0.0.0.0", err => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
