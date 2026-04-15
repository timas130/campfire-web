import FeedLayout from "../../../components/FeedLayout";
import NoticeCard from "../../../components/cards/NoticeCard";
import Input from "../../../components/controls/Input";
import InputLabel from "../../../components/controls/InputLabel";
import Button from "../../../components/controls/Button";
import classNames from "classnames";
import classes from "../../../styles/Auth.module.css";
import {useState} from "react";
import Spinner from "../../../components/Spinner";
import {useRequiredUser} from "../../../lib/client-api";
import Head from "next/head";

export default function PasswordSettings() {
  const user = useRequiredUser();
  const [passwordShown, setPasswordShown] = useState(false);
  const [loadingState, setLoadingState] = useState({state: "idle"});

  const onSubmit = async ev => {
    ev.preventDefault();
    setLoadingState({state: "loading"});
    const data = new FormData(ev.target);
    const oldPassword = data.get("old-password");
    const newPassword = data.get("new-password");
    if (newPassword.length < 8) {
      setLoadingState({state: "error", error: "Слишком короткий пароль, минимум 8 символов"});
      return;
    }
    try {
      const resp = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({oldPassword, newPassword}),
      });
      const json = await resp.json();
      if (json.error) {
        const code = json.response?.code;
        const message = json.response?.messageError || "";
        setLoadingState({
          state: "error",
          error:
            code === "INVALID_CREDENTIALS" || message.includes("WrongPassword") ? "Неправильный старый пароль" :
            `Ошибка. Код: ${code || "?"}`,
        });
        return;
      }
      setLoadingState({state: "idle"});
      window.location = "/me/settings?state=password_changed";
    } catch (e) {
      setLoadingState({state: "error", error: "Сетевая ошибка. Попробуйте позже."});
    }
  };

  if (!user) return <Spinner className={classes.fullpageSpinner} />;

  return <FeedLayout
    list={<form onSubmit={onSubmit}>
      <Head><title>Изменение пароля | Bonfire</title></Head>
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
          <Button type="submit" className={classes.buttonRight}>Поменять пароль</Button> :
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
