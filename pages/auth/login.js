import classes from "../../styles/Auth.module.css";
import Head from "next/head";
import Link from "next/link";
import Input from "../../components/controls/Input";
import InputLabel from "../../components/controls/InputLabel";
import Button from "../../components/controls/Button";
import MetaTags from "../../components/MetaTags";
import {useState} from "react";
import {signInWithEmailAndPassword} from "firebase/auth";
import shajs from "sha.js";
import {fbAuth} from "../../lib/firebase";
import Spinner from "../../components/Spinner";
import {useRouter} from "next/router";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const submit = ev => {
    ev.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    const data = new FormData(ev.target);
    const email = data.get("email");
    const password = shajs("sha512").update(data.get("password")).digest("hex");

    signInWithEmailAndPassword(fbAuth, email, password)
      .then(cred => {
        if (cred.user.emailVerified) {
          window.location = "/";
        } else {
          // noinspection JSIgnoredPromiseFromCall
          router.push("/auth/register");
        }
      })
      .catch(err => {
        setError(
          err.code === "auth/invalid-email" ? "Неправильный e-mail" :
          err.code === "auth/wrong-password" ? "Неправильный пароль" :
          err.code === "auth/quota-exceeded" ? "Превышена квота. Попробуйте позже" :
          err.code === "auth/unauthorized-domain" ? "Зеоны всё сломали. Напишите ситу :)" :
          `Неизвестная ошибка. Код: ${err.code}`
        );
        setIsLoading(false);
      });
  };

  return <>
    <Head>
      <title>Войти в Campfire</title>
      <MetaTags
        title="Войти в Campfire"
        url="https://campfire.moe/auth/login"
      />
    </Head>
    <div className={classes.layout}>
      <form className={classes.card} onSubmit={submit}>
        <h1 className={classes.h1}>
          Вход
        </h1>
        {/* FIXME: generate error pages statically */}
        {error && <div className={classes.error}>
          {error}
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
        <input type="hidden" name="redir" value="true" />
        <div className={classes.buttons}>
          <Link href="/auth/register" passHref><Button type="button" noBackground>Регистрация</Button></Link>
          {!isLoading ?
            <Button type="submit" className={classes.buttonRight}>Войти</Button> :
            <Spinner className={classes.spinner} />}
        </div>
      </form>
    </div>
  </>;
}
