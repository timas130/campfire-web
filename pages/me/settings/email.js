import Head from "next/head";
import InputLabel from "../../../components/controls/InputLabel";
import Input from "../../../components/controls/Input";
import classes from "../../../styles/Auth.module.css";
import Button from "../../../components/controls/Button";
import Spinner from "../../../components/Spinner";
import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import FeedLayout from "../../../components/FeedLayout";
import {authStatePromise, fbAuth} from "../../../lib/firebase";
import {EmailAuthProvider, reauthenticateWithCredential, sendEmailVerification, updateEmail} from "firebase/auth";
import NoticeCard from "../../../components/cards/NoticeCard";
import shajs from "sha.js";

export default function EmailSettings() {
  const router = useRouter();
  const [isFbLoaded, setIsFbLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      await authStatePromise;
      setIsFbLoaded(true);
    })();
  }, []);

  const submit = ev => {
    ev.preventDefault();
    if (!fbAuth.currentUser) {
      setError("Вы не вошли в аккаунт.");
      return;
    }
    if (isLoading) return;
    setError(null);
    setIsLoading(true);

    const data = new FormData(ev.target);

    reauthenticateWithCredential(fbAuth.currentUser, EmailAuthProvider.credential(
      fbAuth.currentUser.email,
      shajs("sha512").update(data.get("password")).digest("hex"),
    )).then(() => {
      updateEmail(fbAuth.currentUser, data.get("email")).then(() => {
        sendEmailVerification(fbAuth.currentUser).then(() => {
          setIsLoading(false);
          router.push("/auth/register?again=true");
        }).catch(err => {
          setIsLoading(false);
          setError(`Ошибка при отправке письма. Код: ${err.code}`);
        });
      }).catch(err => {
        setIsLoading(false);
        setError(
          err.code === "auth/email-already-in-use" ? "Эта почта уже используется." :
          err.code === "auth/invalid-email" ? "Это не похоже на адрес электронной почты." :
          `Ошибка при изменении почты. Код: ${err.code}`
        );
      });
    }).catch(err => {
      setIsLoading(false);
      setError(err.code === "auth/wrong-password" ?
        "Неправильный старый пароль" :
        `Ошибка при повторном входе в аккаунт. Код: ${err.code}`);
    });
  };

  if (!isFbLoaded) return <Spinner className={classes.fullpageSpinner} />;

  return <FeedLayout
    list={<form onSubmit={submit}>
      <Head>
        <title>Изменение e-mail | Campfire</title>
      </Head>

      {error && <NoticeCard title="Ошибка" content={error} />}
      <InputLabel>
        Текущий пароль
        <Input type="password" name="password" autoComplete="current-password" required
               placeholder="••••••••" />
      </InputLabel>
      <InputLabel>
        Новый e-mail
        <Input type="email" name="email" autoComplete="email"
               placeholder="me@sit.sh" required />
      </InputLabel>
      <div className={classes.buttons}>
        {!isLoading ?
          <Button type="submit" className={classes.buttonRight}>
            Поменять почту
          </Button> :
          <Spinner className={classes.spinner} />}
      </div>
    </form>}
  />;
}
