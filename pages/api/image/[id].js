import {sendErrorIfFromRemote, sendRequest} from "../custom";
import cache from "memory-cache";

export default async function handler(req, res) {
  let {id} = req.query;
  if (id.endsWith(".jpg")) {
    id = id.substr(0, id.length - 4);
  }
  const cached = cache.get("/api/image/" + id);
  if (cached) {
    res.setHeader("Content-Type", "image/jpeg");
    res.send(cached);
    return;
  }
  try {
    const image = await sendRequest(
      "RResourcesGet",
      {
        "$$dataload$$": true,
        "resourceId": id
      },
      true
    );
    cache.put("/api/image/" + id, image, 600000);
    res.setHeader("Content-Type", "image/jpeg");
    res.send(image);
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
