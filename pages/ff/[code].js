import cache from "memory-cache";
import {fetchUserInfo} from "../api/user";
import Head from "next/head";
import classes from "../../styles/Auth.module.css";
import Link from "next/link";

export default function FFLoginPage({error, expected = 0}) {
  let message;
  if (error === "ok") {
    message = <p>Вы успешно вошли! Теперь можно снова зайти на сервер.</p>;
  } else if (error === "invalid_account") {
    message = <p>
      Войти не удалось, потому что вам нужно войти
      в <Link href={`/account/${expected}`}><a>этот аккаунт</a></Link>.
    </p>;
  } else if (error === "not_found") {
    message = <p>
      Войти не удалось, потому что вы ввели неправильную ссылку
      или её срок действия подошёл к концу. Зайдите на сервер
      и получите новую ссылку.
    </p>;
  } else {
    message = <p>
      Войти не удалось из-за каких-то технических шоколадок, и
      никто не знает каких. Жизнь жестока, я знаю.
    </p>;
  }

  return <>
    <Head>
      <title>Вход в FriendlyFire | Campfire</title>
    </Head>
    <div className={classes.card}>
      <h1 className={classes.h1}>
        FriendlyFire
      </h1>
      {message}
    </div>
  </>;
}

export async function getServerSideProps(ctx) {
  let user;
  try {
    user = await fetchUserInfo(ctx.req, ctx.res);
  } catch (e) {
    return {
      redirect: {
        destination: "/auth/login?redir=" + encodeURIComponent(ctx.req.url),
      },
    };
  }

  if (ctx.params.code.length !== 6) throw "invalid code"; // too lazy
  const authKey = `ff_auth::${ctx.params.code}`;
  const authObject = cache.get(authKey);
  if (authObject) {
    if (user.J_ID !== authObject.expectedId) {
      return {
        props: {
          error: "invalid_account",
          expected: authObject.expectedId,
        },
      };
    }

    cache.put(authKey, {
      ...authObject,
      logged: true,
    }, 300000);
    return {
      props: {
        error: "ok",
      },
    };
  } else {
    return {
      props: {
        error: "not_found",
      },
    };
  }
}
