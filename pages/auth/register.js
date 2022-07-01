import classes from "../../styles/Auth.module.css";
import Head from "next/head";
import Link from "next/link";
import Input from "../../components/controls/Input";
import InputLabel from "../../components/controls/InputLabel";
import Button from "../../components/controls/Button";
import {useEffect, useState} from "react";
import classNames from "classnames";
import CImage from "../../components/CImage";
import MetaTags from "../../components/MetaTags";
import useSWR from "swr";
import {useTheme} from "../../lib/theme";
import {useInterval} from "../../lib/client-api";
import Spinner from "../../components/Spinner";
import {useRouter} from "next/router";
import Script from "next/script";

const androidApp = "https://play.google.com/store/apps/details?id=com.dzen.campfire";

export function HCaptchaBox() {
  const {data: {siteKey} = {}} = useSWR("/api/project/captcha");
  const theme = useTheme().theme;
  const [libLoaded, setLibLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useInterval(() => {
    if (window.hcaptcha && !libLoaded) setLibLoaded(true);
  }, 1000, [libLoaded]);
  useEffect(() => {
    if (siteKey) {
      if (!libLoaded) return;
      window.hcaptcha.render("hcaptcha_box", {sitekey: siteKey, theme});
      setIsLoading(false);
    }
  }, [siteKey, libLoaded]);

  return <>
    <Script src="https://js.hcaptcha.com/1/api.js?hl=ru&render=explicit"></Script>
    {isLoading && <div className={classes.captchaLoader}>
      <Spinner className={classes.spinner} />
      Загрузка...
    </div>}
    <div id="hcaptcha_box" />
  </>;
}

export default function Register() {
  const error = useRouter().query.error;

  return <>
    <Head>
      <title>Регистрация в Campfire</title>
      <MetaTags
        title="Регистрация в Campfire"
        url="https://campfire.moe/auth/register"
      />
    </Head>
    <div className={classNames(classes.layout, "container")}>
      <div className={classes.registerLayoutLeft}>
        <div className={classes.layoutLeftImage}>
          <CImage id={419904} w={513/3} h={490/3} />
          <CImage id={419898} w={458/3} h={512/3} />
        </div>
        <div className={classes.layoutLeftText}>
          <h2>Добро пожаловать в Campfire</h2>
          <p>
            Campfire &mdash; уютное место для сообществ по интересам,
            которое полностью модерируется пользователями.
          </p>
          <p>
            Сейчас веб-версия Campfire готова не полностью, поэтому
            проще использовать <a href={androidApp} target="_blank"
                                  rel="noreferrer nofollow">приложение для Android</a>,
            но мы будем рады если Вы присоединитесь.
          </p>
        </div>
      </div>
      <form
        className={classNames(classes.card, classes.registerLayoutRight)}
        method="post" action="/api/auth/register"
      >
        <h1 className={classes.h1}>
          Заходите на огонек
        </h1>
        {error && <div className={classes.error}>
          {
            error === "E_LOGIN_LENGTH" ? "Слишком короткий ник." :
            error === "E_LOGIN_CHARS" ? "В нике можно использовать только латинские буквы и цифры (арабские)." :
            error === "E_LOGIN_NOT_ENABLED" ? "Этот ник уже занят." :
            error === "E_TERMS" ? "Необходимо принять условия." :
            error === "E_EMAIL_EXIST" ? "Этот e-mail уже занят. Если что, восстановить пароль нельзя. :)" :
            error === "E_CAPTCHA_FAILED" ? "Вы не прошли проверку на робота." :
              "Неизвестная ошибка. Напишите sit'у с текущем временем."
          }
        </div>}
        <InputLabel>
          Никнейм:
          <Input
            type="text" autoComplete="nickname" name="nickname"
            placeholder="Zeon" required
          />
        </InputLabel>
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
            type="password" autoComplete="new-password" name="password"
            placeholder="••••••••" required
          />
        </InputLabel>
        <HCaptchaBox />
        <InputLabel horizontal>
          <Input type="checkbox" name="rules-agree" required />
          <div>
            Я согласен с <Link href="/app/rules"><a>правилами приложения</a></Link> и&nbsp;
            <Link href="/app/privacy"><a>политикой конфиденциальности</a></Link>.
          </div>
        </InputLabel>
        <input type="hidden" name="redir" value="true" />
        <div className={classes.buttons}>
          <Link href="/auth/login" passHref><Button type="button" noBackground>Вход</Button></Link>
          <Button
            type="submit" className={classes.buttonRight}
          >Зарегистрироваться</Button>
        </div>
      </form>
    </div>
  </>;
}
