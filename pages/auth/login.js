import classes from "../../styles/Auth.module.css";
import Head from "next/head";
import Link from "next/link";
import Input from "../../components/controls/Input";
import InputLabel from "../../components/controls/InputLabel";
import Button from "../../components/controls/Button";
import MetaTags from "../../components/MetaTags";
import {useState} from "react";
import Spinner from "../../components/Spinner";
import {googleRedirectUrl} from "../../lib/google";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Google OAuth client-side wiring (state/nonce round-trip across the Google redirect)
  // is deferred from the MVP migration. Server endpoints /api/auth/oauth-url and
  // /api/auth/oauth-login are ready; re-enable this flag once the client-side flow lands.
  const GOOGLE_OAUTH_ENABLED = false;

  const submit = async ev => {
    ev.preventDefault();
    if (isLoading) return;
    setIsLoading(true);
    setError(null);

    const data = new FormData(ev.target);
    const email = data.get("email");
    const password = data.get("password");

    try {
      const resp = await fetch("/api/auth/login", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({email, password}),
      });
      const json = await resp.json();
      if (json.tfa) {
        setError("2FA не поддерживается в веб-клиенте. Отключите 2FA в приложении.");
        setIsLoading(false);
        return;
      }
      if (json.error) {
        const code = json.response?.code;
        const message = json.response?.messageError || "";
        setError(
          code === "INVALID_CREDENTIALS" || message.includes("WrongEmail") || message.includes("WrongPassword") ? "Неправильный e-mail или пароль" :
          code === "RATE_LIMITED" || code === "ERROR_RATE_LIMIT" ? "Превышена квота. Попробуйте позже" :
          code === "ERROR_NETWORK" ? "Сетевая ошибка. Попробуйте позже." :
          `Неизвестная ошибка. Код: ${code || "?"}`
        );
        setIsLoading(false);
        return;
      }
      window.location = "/";
    } catch (e) {
      setError("Сетевая ошибка. Попробуйте позже.");
      setIsLoading(false);
    }
  };

  return <>
    <Head>
      <title>Войти в Bonfire</title>
      <MetaTags title="Войти в Bonfire" url={`${process.env.siteUrl}/auth/login`} />
    </Head>
    <div className={classes.layout}>
      <form className={classes.card} onSubmit={submit}>
        <h1 className={classes.h1}>Вход</h1>
        <p>Регистрация пока доступна только в приложении.</p>
        {error && <div className={classes.error}>{error}</div>}
        <InputLabel>
          Email:
          <Input type="email" autoComplete="email" name="email" placeholder="me@sit.sh" required />
        </InputLabel>
        <InputLabel>
          Пароль:
          <Input type="password" autoComplete="current-password" name="password" placeholder="••••••••" required />
        </InputLabel>
        <div className={classes.buttons}>
          {GOOGLE_OAUTH_ENABLED && (
            <Link href={googleRedirectUrl} passHref legacyBehavior>
              <Button el="a" secondary>Войти через Google</Button>
            </Link>
          )}
          {!isLoading ?
            <Button type="submit" className={classes.buttonRight}>Войти</Button> :
            <Spinner className={classes.spinner} />}
        </div>
      </form>
    </div>
  </>;
}
