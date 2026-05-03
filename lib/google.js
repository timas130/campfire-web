export const googleClientId = "964513089644-k0uhcerbram8e92gfucmq7joi9picgf6.apps.googleusercontent.com";

export const googleRedirectUri = process.env.siteUrl + "/auth/google";

export const googleRedirectUrl =
  "https://accounts.google.com/o/oauth2/v2/auth" +
  "?client_id=" + googleClientId +
  "&redirect_uri=" + encodeURIComponent(googleRedirectUri) +
  "&response_type=code" +
  "&scope=openid" +
  "&access_type=offline";
