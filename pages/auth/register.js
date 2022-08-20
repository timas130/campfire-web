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
import Spinner from "../../components/Spinner";
import {createUserWithEmailAndPassword, sendEmailVerification} from "firebase/auth";
import {authStatePromise, fbAuth} from "../../lib/firebase";
import shajs from "sha.js";
import {showButtonToast} from "../../lib/ui";
import {mutate} from "swr";
import {useRouter} from "next/router";
import {fetcher} from "../../lib/client-api";

const androidApp = "https://play.google.com/store/apps/details?id=com.dzen.campfire";

// look at the history of this file for an awesome hcaptcha box!

export default function Register() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAccountLoaded, setIsAccountLoaded] = useState(false);
  const [lastUserUpdate, setLastUserUpdate] = useState(Date.now());

  useEffect(() => {
    (async () => {
      await authStatePromise;
      setIsAccountLoaded(true);
    })();
  }, []);

  useEffect(() => {
    if (! fbAuth.currentUser) return;
    if (! fbAuth.currentUser.emailVerified) {
      setTimeout(() => {
        fbAuth.currentUser.reload()
          .then(() => setLastUserUpdate(Date.now()))
          .catch(err => setError(`Ошибка. Код: ${err.code}`));
      }, 3000);
    }

    // shut up
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastUserUpdate, (fbAuth.currentUser || {}).emailVerified]);

  if (!isAccountLoaded) return <Spinner className={classes.fullpageSpinner} />;

  if (! fbAuth.currentUser) {
    const submit = ev => {
      ev.preventDefault();
      if (isLoading) return;
      setError(null);
      setIsLoading(true);

      const data = new FormData(ev.target);
      const email = data.get("email");
      const password = shajs("sha512").update(data.get("password")).digest("hex");

      createUserWithEmailAndPassword(fbAuth, email, password)
        .then(cred => {
          sendEmailVerification(cred.user).then(() => {
            setLastUserUpdate(Date.now());
          }).catch(err => {
            setError(`Неизвестная ошибка. Код: ${err.code}`);
          }).finally(() => {
            setIsLoading(false);
          });
        })
        .catch(err => {
          setError(
            err.code === "auth/invalid-email" ? "Неправильный e-mail" :
            err.code === "auth/email-already-in-use" ? "Такой e-mail уже используется." :
            err.code === "auth/unauthorized-domain" ? "Зеоны всё сломали. Напишите ситу :)" :
            `Неизвестная ошибка. Код: ${err.code}`
          );
          setIsLoading(false);
        });
    };

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
            <CImage id={419904} w={513 / 3} h={490 / 3}/>
            <CImage id={419898} w={458 / 3} h={512 / 3}/>
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
        <form className={classNames(classes.card, classes.registerLayoutRight)} onSubmit={submit}>
          <h1 className={classes.h1}>
            Заходите на огонек
          </h1>
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
              type="password" autoComplete="new-password" name="password"
              placeholder="••••••••" required
            />
          </InputLabel>
          <InputLabel horizontal>
            <Input type="checkbox" name="rules-agree" required/>
            <div>
              Я согласен с <Link href="/app/rules"><a>правилами приложения</a></Link> и&nbsp;
              <Link href="/app/privacy"><a>политикой конфиденциальности</a></Link>.
            </div>
          </InputLabel>
          <input type="hidden" name="redir" value="true"/>
          <div className={classes.buttons}>
            <Link href="/auth/login" passHref><Button type="button" noBackground>Вход</Button></Link>
            {!isLoading ?
              <Button type="submit" className={classes.buttonRight}>Зарегистрироваться</Button> :
              <Spinner className={classes.spinner}/>}
          </div>
        </form>
      </div>
    </>;
  } else if (!fbAuth.currentUser.emailVerified) {
    return <>
      <Head>
        <title>Регистрация в Campfire</title>
        <MetaTags
          title="Регистрация в Campfire"
          url="https://campfire.moe/auth/register"
        />
      </Head>
      <div className={classes.layout}>
        <div className={classes.card}>
          <h1 className={classes.h1}>
            Подтверждение почты
          </h1>
          {error && <div className={classes.error}>
            {error}
          </div>}
          <p>
            В течение 10 минут к вам в почтовый ящик придёт письмо о регистрации.
            Пройдите по ссылке, чтобы закончить регистрацию.
          </p>
          <p>
            После этого возвращайтесь на эту страницу.
          </p>
          <p>
            Если письмо не приходит, проверьте папку Спам.
          </p>
          <div className={classes.buttons}>
            <Button secondary onClick={ev => {
              setError(null);
              setIsLoading(true);
              sendEmailVerification(fbAuth.currentUser)
                .then(() => {
                  showButtonToast(ev.target, "Письмо отправлено");
                })
                .catch(err => {
                  setError(`Неизвестная ошибка. Код: ${err.code}`);
                })
                .finally(() => setIsLoading(false));
            }}>
              {isLoading && <Spinner className={classes.leftSpinner} />}
              Отправить письмо снова
            </Button>
            <Button
              className={classes.buttonRight}
              onClick={() => {
                setError(null);
                fbAuth.signOut().finally(() => setLastUserUpdate(Date.now()));
              }}
            >
              Выйти
            </Button>
          </div>
        </div>
      </div>
    </>;
  } else {
    const submit = ev => {
      ev.preventDefault();
      if (isLoading) return;
      setError(null);
      setIsLoading(true);

      const data = new FormData(ev.target);
      const nickname = data.get("nickname");

      fetcher("/api/auth/nickname", {
        method: "POST",
        headers: {"content-type": "application/json"},
        body: JSON.stringify({nickname}),
      }).then(() => {
        mutate("/api/user")
          .then(() => router.push("/"))
          .catch(() => window.location = "/"); // xd
      }).catch(err => {
        setError(
          err.code === "E_LOGIN_IS_NOT_DEFAULT" ? "Вы уже изменили ник." :
          err.code === "E_LOGIN_LENGTH" ? "Слишком короткий или длинный ник." :
          err.code === "E_LOGIN_CHARS" ? "Используются недопустимые символы." :
          err.code === "E_LOGIN_NOT_ENABLED" ? "Пользователь с таким ником уже существует." :
          `Неизвестная ошибка. Код: ${err.code}`
        );
      }).finally(() => {
        setIsLoading(false);
      });
    };

    return <>
      <Head>
        <title>Регистрация в Campfire</title>
        <MetaTags
          title="Регистрация в Campfire"
          url="https://campfire.moe/auth/register"
        />
      </Head>
      <div className={classes.layout}>
        <form className={classes.card} onSubmit={submit}>
          <h1 className={classes.h1}>Придумайте ник</h1>
          {error && <div className={classes.error}>
            {error}
          </div>}
          <p>
            Добро пожаловать в Campfire! Чтобы другим людям было проще вас
            запомнить, придумайте ник. Он может включать любые буквы латинского
            алфавита и цифры.
          </p>
          <InputLabel>
            Никнейм:
            <Input
              type="text" autoComplete="nickname" name="nickname"
              placeholder="Zeon" required autoFocus
            />
          </InputLabel>
          <div className={classes.buttons}>
            <Button
              type="button"
              secondary
              onClick={() => {
                setError(null);
                fbAuth.signOut().finally(() => setLastUserUpdate(Date.now()));
              }}
            >
              Выйти
            </Button>
            {!isLoading ?
              <Button type="submit" className={classes.buttonRight}>Готово</Button> :
              <Spinner className={classes.spinner} />}
          </div>
        </form>
      </div>
    </>;
  }
}
