import {requireArguments} from "../../../lib/api";
import cache from "memory-cache";

export default async function checkFFKeyHandler(req, res) {
  if (requireArguments(req, res, ["key", "code"])) return;
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

  const authObject = cache.get(`ff_auth::${req.body.code}`);
  if (authObject) {
    res.send({
      loggedIn: authObject.logged,
      id: authObject.expectedId,
    });
  } else {
    res.status(404);
    res.send({
      code: "CODE_NOT_FOUND",
      messageError: "",
      params: [],
      cweb: true,
    });
  }
}
