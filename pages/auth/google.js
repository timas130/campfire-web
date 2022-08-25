import Spinner from "../../components/Spinner";
import classes from "../../styles/Auth.module.css";
import {handleSSRError} from "../../lib/api";
import {googleClientId} from "../../lib/google";
import Cookies from "cookies";
import Button from "../../components/controls/Button";
import Link from "next/link";

export async function getServerSideProps({req, res, query}) {
  try {
    if (query.error) throw query.error;

    const resp = await fetch("https://www.googleapis.com/oauth2/v4/token", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        code: query.code,
        client_id: googleClientId,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: "https://campfire.moe/auth/google",
        grant_type: "authorization_code",
      }),
    }).then(a => a.json());

    if (resp.error) return {props: {error: resp.error}};

    const accessToken = resp.access_token;
    const refreshToken = resp.refresh_token;

    const cookies = new Cookies(req, res, {secure: true});
    cookies.set("google_access_token", accessToken, {
      maxAge: resp.expires_in * 1000 - 100000,
      sameSite: "strict",
      overwrite: true,
      secure: true,
    });
    cookies.set("google_refresh_token", refreshToken, {
      sameSite: "strict",
      overwrite: true,
      secure: true,
    });

    return {redirect: {destination: "/"}};
  } catch (e) {
    return handleSSRError(e, {}, true);
  }
}

export default function GoogleCallback({error}) {
  if (!error) {
    return <Spinner className={classes.fullpageSpinner} />;
  } else {
    return <div className={classes.layout}>
      <div className={classes.card}>
        <h1 className={classes.h1}>
          Ошибка
        </h1>
        <p>
          При входе в Google возникла ошибка. Код: {error}.
        </p>
        <div className={classes.buttons}>
          <Link href="/auth/login" passHref>
            <Button className={classes.buttonRight}>Назад</Button>
          </Link>
        </div>
      </div>
    </div>;
  }
}
