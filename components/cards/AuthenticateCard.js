import postClasses from "../../styles/Post.module.css";
import classes from "../../styles/Card.module.css";
import Button from "../Button";
import Link from "next/link";
import classNames from "classnames";
import {useUser} from "../../lib/client-api";

export default function AuthenticateCard() {
  const account = useUser();

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
