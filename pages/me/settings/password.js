import FeedLayout from "../../../components/FeedLayout";
import NoticeCard from "../../../components/cards/NoticeCard";
import Input from "../../../components/controls/Input";
import InputLabel from "../../../components/controls/InputLabel";
import Button from "../../../components/controls/Button";
import classNames from "classnames";
import classes from "../../../styles/Auth.module.css";
import {useEffect, useState} from "react";
import {useRouter} from "next/router";
import Spinner from "../../../components/Spinner";
import {authStatePromise, fbAuth} from "../../../lib/firebase";
import {EmailAuthProvider, reauthenticateWithCredential, updatePassword} from "firebase/auth";
import shajs from "sha.js";
import Head from "next/head";

export default function PasswordSettings() {
  const router = useRouter();
  const [passwordShown, setPasswordShown] = useState(false);
  const [loadingState, setLoadingState] = useState({state: "loading-fb"});

  useEffect(() => {
    (async () => {
      await authStatePromise;
      if (!fbAuth.currentUser) router.push("/auth/login");
      else setLoadingState({state: "idle"});
    })();
  }, [router]);

  const onSubmit = ev => {
    ev.preventDefault();
    setLoadingState({state: "loading"});
    const data = new FormData(ev.target);
    if (data.get("new-password").length < 8) {
      setLoadingState({state: "error", error: "Слишком короткий пароль, минимум 8 символов"});
      return;
    }

    reauthenticateWithCredential(fbAuth.currentUser, EmailAuthProvider.credential(
      fbAuth.currentUser.email,
      shajs("sha512").update(data.get("old-password")).digest("hex"),
    )).then(() => {
      updatePassword(
        fbAuth.currentUser,
        shajs("sha512").update(data.get("new-password")).digest("hex"),
      ).then(() => {
        setLoadingState({state: "idle"});
        router.push("/me/settings?state=password_changed");
      }).catch(err => {
        setLoadingState({state: "error", error: "Ошибка. Код: " + err.code});
      });
    }).catch(err => {
      setLoadingState({
        state: "error",
        error: err.code === "auth/wrong-password" ?
          "Неправильный старый пароль" :
          `Ошибка. Код: ${err.code}`,
      });
    });
  };

  if (loadingState.state === "loading-fb") {
    return <Spinner className={classes.fullpageSpinner} />;
  }

  return <FeedLayout
    list={<form onSubmit={onSubmit}>
      <Head>
        <title>Изменение пароля | Campfire</title>
      </Head>

      {loadingState.state === "error" && <NoticeCard title="Ошибка" content={loadingState.error} />}
      <InputLabel>
        Старый пароль
        <Input type="password" name="old-password" autoComplete="current-password" required
               placeholder="••••••••" disabled={loadingState.state === "loading"} />
      </InputLabel>
      <InputLabel noInputMargin>
        Новый пароль
        <div className={classes.horizontal}>
          <Input
            type={passwordShown ? "text" : "password"} name="new-password"
            autoComplete="new-password" placeholder="••••••••••••" required
            className={classNames(classes.noMargin, classes.horizontalInput)}
            data-password disabled={loadingState.state === "loading"}
          />
          <Button type="button" onClick={() => setPasswordShown(!passwordShown)} secondary>
            {passwordShown ? "Скрыть" : "Показать"}
          </Button>
        </div>
      </InputLabel>
      <div className={classes.buttons}>
        {loadingState.state !== "loading" ?
          <Button type="submit" className={classes.buttonRight}>
            Поменять пароль
          </Button> :
          <Spinner className={classes.spinner} />}
      </div>
    </form>}
    staticSidebar={<NoticeCard
      title="Требования к паролю"
      content={"Единственное простое правило: не менее 8 символов. Мы " +
        "уверены, что придумать сложный пароль просто."}
    />}
  />;
}
