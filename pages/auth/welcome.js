import Head from "next/head";
import Link from "next/link";
import {useRequiredUser} from "../../lib/client-api";
import classes from "../../styles/Rules.module.css";
import Button from "../../components/controls/Button";
import classNames from "classnames";

export default function WelcomePage() {
  const user = useRequiredUser();

  return <div className={classNames(classes.root, "container")}>
    <Head>
      <title>Добро пожаловать в Campfire</title>
    </Head>
    <h1>Добро пожаловать в Campfire!</h1>
    <p className={classes.ruleContent}>
      Мы рады, что вы к нам присоединились! Не забудьте прочитать&nbsp;
      <Link href="/app/rules"><a>правила приложения</a></Link>.
      Также загляните в <Link href="/fandom"><a>список фэндомов</a></Link>,
      чтобы найти то, что вам по душе. Ну или просто листайте глобальную&nbsp;
      <Link href="/"><a>ленту</a></Link>, общайтесь с пользователями
      и поднимайте <Link href={`/account/${user?.J_ID || 0}/level`}><a>уровень</a></Link>.
    </p>
    <Link href="/" passHref><Button el="a">На главную</Button></Link>
  </div>;
}
