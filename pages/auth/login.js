import Layout from "../../components/Layout";
import classes from "../../styles/Auth.module.css";
import Head from "next/head";
import Link from "next/link";
import Input from "../../components/Input";
import InputLabel from "../../components/InputLabel";
import Button from "../../components/Button";

export default function Login() {
  return <Layout dark>
    <Head>
      <title>Войти | Campfire</title>
    </Head>
    <form className={classes.card} method="post" action="/api/auth/login">
      <h1 className={classes.h1}>
        Вход
      </h1>
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
      <div className={classes.buttons}>
        <Link href="/auth/register" passHref><Button noBackground>Регистрация</Button></Link>
        <Button type="submit" className={classes.buttonRight}>Войти</Button>
      </div>
    </form>
  </Layout>;
}
