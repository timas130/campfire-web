import {graphql, readTokens} from "../../../lib/server";
import {sendError, sendErrorIfFromRemote} from "../../../lib/api";

const QUERY = `query DailyQuest {
  me {
    dailyTask {
      progress
      possibleReward
      fandomName
      task {
        __typename
        ... on AnswerInChatTask { amount }
        ... on AnswerNewbieCommentTask { amount maxLevel }
        ... on CommentInFandomTask { amount fandomId }
        ... on CommentNewbiePostTask { amount maxLevel }
        ... on CreatePostWithPageTypeTask { amount pageType }
        ... on CreatePostsTask { amount }
        ... on EarnAnyKarmaTask { amount }
        ... on EarnPostKarmaTask { amount }
        ... on LoginTask { amount }
        ... on PostCommentsTask { amount }
        ... on PostInFandomTask { amount fandomId }
        ... on RatePublicationsTask { amount }
        ... on WriteMessagesTask { amount }
      }
    }
  }
}`;

export async function fetchDailyQuest(req, res) {
  const {accessToken} = readTokens(req, res);
  if (!accessToken) {
    throw {code: "ERROR_UNAUTHORIZED", messageError: "Not logged in", params: [], cweb: true};
  }
  const data = await graphql(QUERY, {}, accessToken);
  return data?.me?.dailyTask || null;
}

export default async function dailyQuestHandler(req, res) {
  try {
    const quest = await fetchDailyQuest(req, res);
    if (!quest) return sendError(res, {code: "ERROR_GONE", messageError: "no daily task"}, 404);
    res.send(quest);
  } catch (e) {
    if (e?.code === "ERROR_UNAUTHORIZED") return sendError(res, e, 401);
    sendErrorIfFromRemote(res, e);
  }
}
