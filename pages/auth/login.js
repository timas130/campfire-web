import classes from "../../styles/Auth.module.css";
import Head from "next/head";
import Link from "next/link";
import Input from "../../components/Input";
import InputLabel from "../../components/InputLabel";
import Button from "../../components/Button";
import {useRouter} from "next/router";

export default function Login() {
  const router = useRouter();
  const error = router.query.error;
  return <>
    <Head>
      <title>Войти | Campfire</title>
    </Head>
    <form className={classes.card} method="post" action="/api/auth/login">
      <h1 className={classes.h1}>
        Вход
      </h1>
      {/* FIXME: generate error pages statically */}
      {error && <div className={classes.error}>
        {
          error === "unauthorized" ? "Неправильный логин или пароль" :
          "Неизвестная ошибка"
        }
      </div>}
      <InputLabel>
        Email:
        <Input
          type="email" autoComplete="email" name="email"
          placeholder="me@33rd.dev" required
        />
      </InputLabel>
      <InputLabel>
        Пароль:
        <Input
          type="password" autoComplete="current-password" name="password"
          placeholder="••••••••" required
        />
      </InputLabel>
      <input type="hidden" name="redir" value={router.query.redir || "true"} />
      <div className={classes.buttons}>
        <Link href="/auth/register" passHref><Button noBackground>Регистрация</Button></Link>
        <Button type="submit" className={classes.buttonRight}>Войти</Button>
      </div>
    </form>
  </>;
}
