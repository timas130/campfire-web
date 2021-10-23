import Cookies from "cookies";

export default function logoutHandler(req, res) {
  const cookies = new Cookies(req, res);
  cookies.set("token", null);
  cookies.set("refreshToken", null);
  cookies.set("loginToken", null);
  res.redirect("/");
}
