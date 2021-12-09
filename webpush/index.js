const {sendRequest} = require("../lib/server");
const fastify = require("fastify")({ logger: true });
fastify.register(require("fastify-websocket"));
const genUUID = require("uuid").v4;
const {sign, verify} = require("jsonwebtoken");
require("dotenv").config({
  path: ".env.local",
});
const rawBody = require("raw-body");

const selfUrl = "https://push.33rd.dev/push";

const registrations = {};

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

async function unregister(reg) {
  if (reg.loginToken)
    await sendRequest("RAccountsNotificationsRemoveToken", {
      tokenNotification: reg.registrationToken,
      J_API_LOGIN_TOKEN: reg.loginToken,
    });
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

    registrations[reg.uuid] = {
      timeout: setTimeout(() => {
        unregister(registrations[reg.uuid]);
        delete registrations[reg.uuid];
        fastify.log.info("deleted registration (timeout)", reg.uuid);
      }, 60000),
      websocket: null,
      loginToken: (req.body || {}).loginToken || null,
      ...reg,
    };

    return {
      listenToken: reg.listenToken,
      sendToken: reg.sendToken,
    };
  },
});

fastify.post("/push", async (req, res) => {
  const results = [];
  (req.body.registration_ids || [req.body.to]).forEach(token => {
    let uuid;
    try {
      uuid = verify(token, process.env.JWT_SECRET, {
        "audience": "pushrelay-send",
      }).sub;
    } catch (e) {
      results.push({message_id: "cweb", error: "NotRegistered"});
      return;
    }

    const registration = registrations[uuid];
    if (!registration) {
      results.push({message_id: "cweb", error: "NotRegistered"});
      return;
    }

    if (registration.websocket) {
      registration.websocket.write(JSON.stringify(req.body.data));
    }

    results.push({message_id: "cweb"});
  });

  res.status(200);
  return {results};
});

fastify.get("/stream", {websocket: true}, (conn, req) => {
  const authToken = req.headers.authorization || req.headers["sec-websocket-protocol"];
  const uuid = verify(authToken, process.env.JWT_SECRET, {
    "audience": "pushrelay-listen",
  }).sub;

  const reg = registrations[uuid];
  if (!reg) conn.socket.destroy("registration is not valid");

  conn.socket.on("close", () => {
    fastify.log.info("deleted registration (closed)", reg.uuid);
    unregister(reg)
      .catch(e => fastify.log.warn(e))
      .finally(() => delete registrations[reg.uuid]);
  });

  clearTimeout(reg.timeout);
  reg.timeout = null;
  reg.websocket = conn;
});

fastify.listen(3001, err => {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
