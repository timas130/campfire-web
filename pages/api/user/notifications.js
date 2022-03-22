import {sendRequestAuthenticated} from "../../../lib/server";
import {sendErrorIfFromRemote} from "../../../lib/api";

export async function fetchNotifications(req, res, offset = 0) {
  return (await sendRequestAuthenticated(
    req, res, "RAccountsNotificationsGetAll", {
      offsetDate: offset,
      filters: [], // empty means all
      otherEnabled: true,
    },
  )).J_RESPONSE.notifications;
}

export default async function notificationsHandler(req, res) {
  try {
    res.send(await fetchNotifications(req, res, parseInt(req.query.offset) || 0));
  } catch (e) {
    sendErrorIfFromRemote(res, e);
  }
}
