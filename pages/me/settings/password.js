import FeedLayout from "../../../components/FeedLayout";
import NoticeCard from "../../../components/cards/NoticeCard";
import Input from "../../../components/controls/Input";
import InputLabel from "../../../components/controls/InputLabel";
import Button from "../../../components/controls/Button";
import classNames from "classnames";
import classes from "../../../styles/Auth.module.css";
import {useState} from "react";
import {useRouter} from "next/router";

export default function PasswordSettings() {
  const router = useRouter();
  const [passwordShown, setPasswordShown] = useState(false);
  const [loadingState, setLoadingState] = useState({state: "idle"});

  const onSubmit = ev => {
    ev.preventDefault();
    setLoadingState({state: "loading"});
    const data = new FormData(ev.target);
    if (data.get("new-password").length < 8) {
      setLoadingState({state: "error", error: "Слишком короткий пароль, минимум 8 символов"});
      return;
    }

    fetch("/api/user/password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        old: data.get("old-password"),
        new: data.get("new-password"),
      }),
    }).then(resp => resp.json()).then(resp => {
      if (resp.error) {
        setLoadingState({state: "error", error: "Не получилось изменить пароль"});
      } else {
        setLoadingState({state: "idle"});
        router.push("/me/settings?state=password_changed");
      }
    }).catch(e => {
      console.warn(e);
      setLoadingState({state: "error", error: "Не получилось изменить пароль"});
    });
  };

  return <FeedLayout
    list={<form onSubmit={onSubmit}>
      {loadingState.state === "error" && <NoticeCard title="Ошибка" content={loadingState.error} />}
      <InputLabel>
        Старый пароль
        <Input type="password" name="old-password" autoComplete="current-password"
               placeholder="••••••••" disabled={loadingState.state === "loading"} />
      </InputLabel>
      <InputLabel noInputMargin>
        Новый пароль
        <div className={classes.horizontal}>
          <Input
            type={passwordShown ? "text" : "password"} name="new-password"
            autoComplete="new-password" placeholder="••••••••••••"
            className={classNames(classes.noMargin, classes.horizontalInput)}
            data-password disabled={loadingState.state === "loading"}
          />
          <Button type="button" onClick={() => setPasswordShown(!passwordShown)} secondary>
            {passwordShown ? "Скрыть" : "Показать"}
          </Button>
        </div>
      </InputLabel>
      <div className={classes.buttons}>
        <Button type="submit" className={classes.buttonRight}
                disabled={loadingState.state === "loading"}>
          Поменять пароль
        </Button>
      </div>
    </form>}
    staticSidebar={<NoticeCard
      title="Требования к паролю"
      content={"Единственное простое правило: не менее 8 символов. Мы " +
        "уверены, что придумать сложный пароль просто."}
    />}
  />;
}
