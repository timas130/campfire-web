import cache from "memory-cache";
import {sendRequest} from "../../../lib/server";
import {sendErrorIfFromRemote} from "../../../lib/api";

export default async function handler(req, res) {
  let {id} = req.query;
  const isGif = id.endsWith(".gif");
  res.setHeader("Content-Type", isGif ? "image/gif" : "image/jpeg");
  res.setHeader("Cache-Control", "public, max-age=604800, immutable");
  if (id.endsWith(".jpg") || isGif) {
    id = id.substring(0, id.length - 4);
  }
  const cached = cache.get("/api/image/" + id);
  if (cached) {
    res.send(cached);
    return;
  }
  try {
    const image = await sendRequest(
      "RResourcesGet",
      {
        "$$dataload$$": true,
        "resourceId": id,
      },
      true
    );
    cache.put("/api/image/" + id, image, 600000);
    res.setHeader("Content-Length", image.byteLength);
    res.send(image);
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
