import {sendRequestAuthenticated} from "../../../lib/server";
import {sendErrorIfFromRemote} from "../../../lib/api";

export async function fetchDailyQuest(req, res) {
  return (await sendRequestAuthenticated(
    req, res, "RAchievementsQuestInfo", {}
  )).J_RESPONSE;
}

export default async function dailyQuestHandler(req, res) {
  try {
    res.send(await fetchDailyQuest(req, res));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
