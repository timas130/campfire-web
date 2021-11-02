import Cookies from "cookies";

export function logout(req) {
  const cookies = new Cookies(req, res);
  cookies.set("token", null);
  cookies.set("refreshToken", null);
  cookies.set("loginToken", null);
}

export default function logoutHandler(req, res) {
  logout(req);
  res.redirect("/");
}
