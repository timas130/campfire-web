import {useEffect, useState} from "react";
import cookie from "cookie-cutter";
import postClasses from "../../styles/Post.module.css";
import classes from "../../styles/Card.module.css";
import Button from "../Button";
import Link from "next/link";
import classNames from "classnames";

export default function AuthenticateCard() {
  const [account, setAccount] = useState(null);
  useEffect(() => {
    if (cookie.get("account")) setAccount(JSON.parse(cookie.get("account")));
  }, []);

  if (account) {
    return null;
  }

  return <section className={postClasses.post}>
    <header className={classes.cardTitle}>
      Заходите на огонек!
    </header>
    <div className={classNames(classes.cardContent, classes.authenticate)}>
      <Link href="/auth/register" passHref>
        <Button el="a" fullWidth className={classes.registerButton}>Зарегистрироваться</Button>
      </Link>
      <Link href="/auth/login" passHref>
        <Button el="a" noBackground>Войти</Button>
      </Link>
    </div>
  </section>;
};
