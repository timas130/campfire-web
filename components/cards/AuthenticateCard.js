import postClasses from "../../styles/Post.module.css";
import classes from "../../styles/Card.module.css";
import Button from "../controls/Button";
import Link from "next/link";
import classNames from "classnames";
import {useSWRUser} from "../../lib/client-api";

export default function AuthenticateCard() {
  const {data: account, isValidating: isValidatingUser} = useSWRUser();

  if (account || isValidatingUser) {
    return null;
  }

  return (
    <section className={postClasses.post}>
      <header className={classes.cardTitle}>
        Заходите на огонек!
      </header>
      <div className={classNames(classes.cardContent, classes.authenticate)}>
        <Link href="/auth/login" passHref legacyBehavior>
          <Button el="a" noBackground fullWidth>Войти / Зарегистрироваться</Button>
        </Link>
      </div>
    </section>
  );
};
