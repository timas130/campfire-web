import {requireArguments} from "../../../lib/api";
import cache from "memory-cache";

function generateRandomString(length) {
  const alphabet = "ABCDEFGHIKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return result;
}

export default async function newFFKeyHandler(req, res) {
  if (requireArguments(req, res, ["key", "id"])) return;
  console.log(req.body.key, process.env.FFIRE_SECRET, req.body.key === process.env.FFIRE_SECRET);
  if (req.body.key !== process.env.FFIRE_SECRET) {
    res.status(401);
    res.send({
      code: "INVALID_KEY",
      messageError: "",
      params: [],
      cweb: true,
    });
    return;
  }

  const expectedId = parseInt(req.body.id);
  const code = generateRandomString(6);
  cache.put("ff_auth::" + code, {expectedId, logged: false}, 300000);
  res.send({code});
}
