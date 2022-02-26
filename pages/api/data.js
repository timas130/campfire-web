import {withSentry} from "@sentry/nextjs";
import * as url from "url";

const sentryHost = "data.33rd.dev";
const knownProjectIds = ["campfire-web", "8"];

async function handler(req, res) {
  try {
    const envelope = req.body;
    const pieces = envelope.split("\n");

    const header = JSON.parse(pieces[0]);

    const { host, path } = url.parse(header.dsn);
    if (host !== sentryHost) {
      throw new Error(`invalid host: ${host}`);
    }

    let projectId = path.endsWith("/") ? path.slice(0, -1) : path;
    projectId = projectId.startsWith("/") ? projectId.slice(1) : projectId;
    if (!knownProjectIds.includes(projectId)) {
      throw new Error(`invalid project id: ${projectId}`);
    }

    const url1 = `https://${sentryHost}/api/${projectId}/envelope/`;
    const response = await fetch(url1, {
      method: "POST",
      headers: {
        "X-Real-IP": req.headers["x-real-ip"],
      },
      body: envelope,
    });
    return res.json(await response.json());
  } catch (e) {
    console.error(e);
    return res.status(400).json({ status: "invalid request" });
  }
}

export default withSentry(handler);
