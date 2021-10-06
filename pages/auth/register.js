import classes from "../../styles/Auth.module.css";
import Head from "next/head";
import Link from "next/link";
import Input from "../../components/Input";
import InputLabel from "../../components/InputLabel";
import Button from "../../components/Button";

const googleRules = "https://play.google.com/intl/ru_ALL/about/restricted-content/inappropriate-content/";
const privacyPolicy = "https://sayzen.ru/rus.html";

export default function Register() {
  return <>
    <Head>
      <title>Зарегистрироваться | Campfire</title>
    </Head>
    <form className={classes.card} method="post" action="/api/auth/register">
      <h1 className={classes.h1}>
        Заходите на огонек
      </h1>
      <InputLabel>
        Логин:
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
          Я согласен с <Link href="/app/rules"><a>правилами приложения</a></Link>,&nbsp;
          <a href={privacyPolicy}>политикой конфиденциальности</a>,&nbsp;
          <a href={googleRules}>правилами Google</a>, а также с продажей своей
          бессмертной души <Link href="/account/Zeon"><a>@Zeon&apos;у</a></Link>.
        </div>
      </InputLabel>
      <div className={classes.buttons}>
        <Link href="/auth/login" passHref><Button noBackground>Вход</Button></Link>
        <Button type="submit" className={classes.buttonRight}>Зарегистрироваться</Button>
      </div>
    </form>
  </>;
}
