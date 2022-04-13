import classes from "../../styles/Auth.module.css";
import Head from "next/head";
import Link from "next/link";
import Input from "../../components/controls/Input";
import InputLabel from "../../components/controls/InputLabel";
import Button from "../../components/controls/Button";
import {useState} from "react";
import classNames from "classnames";
import CImage from "../../components/CImage";
import MetaTags from "../../components/MetaTags";

const googleRules = "https://play.google.com/intl/ru_ALL/about/restricted-content/inappropriate-content/";
const privacyPolicy = "https://sayzen.ru/rus.html";
const androidApp = "https://play.google.com/store/apps/details?id=com.dzen.campfire";

export default function Register() {
  const [buttonClicked, setButtonClicked] = useState(0);

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
        method="post" action="/api/auth/register" onSubmit={ev => ev.preventDefault()}
      >
        <h1 className={classes.h1}>
          Заходите на огонек
        </h1>
        <InputLabel>
          Никнейм:
          <Input
            type="text" autoComplete="username" name="login"
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
        <InputLabel horizontal>
          <Input type="checkbox" name="rules-agree" required />
          <div>
            Я согласен с <Link href="/app/rules"><a>правилами приложения</a></Link> и&nbsp;
            <Link href="/app/privacy"><a>политикой конфиденциальности</a></Link>.
          </div>
        </InputLabel>
        <InputLabel horizontal>
          <Input type="checkbox" required />
          <div>
            Я хочу <Link href="/fandom/wiki/2583"><a>продать свою бессмертную душу</a></Link> Zeon&apos;у.
          </div>
        </InputLabel>
        <div className={classes.buttons}>
          <Link href="/auth/login" passHref><Button type="button" noBackground>Вход</Button></Link>
          {buttonClicked < 6 && <Button
            type="submit" className={classes.buttonRight}
            onClick={ev => {
              ev.preventDefault();
              setButtonClicked(x => x+1);
            }}
          >{
            buttonClicked === 0 ? "Регистрация отключена" :
            buttonClicked === 1 ? "Регистрация не работает" :
            buttonClicked === 2 ? "Можно больше не нажимать" :
            buttonClicked === 3 ? "Очень скоро заработает, ..." :
            buttonClicked === 4 ? "когда будет обновление, ..." :
            buttonClicked === 5 ? "в котором включат регистрацию." :
            "ой"
          }</Button>}
        </div>
      </form>
    </div>
  </>;
}
