import Head from "next/head";
import InputLabel from "../../../components/controls/InputLabel";
import Input from "../../../components/controls/Input";
import classes from "../../../styles/Auth.module.css";
import Button from "../../../components/controls/Button";
import Spinner from "../../../components/Spinner";
import {useState} from "react";
import FeedLayout from "../../../components/FeedLayout";
import NoticeCard from "../../../components/cards/NoticeCard";
import {useRequiredUser} from "../../../lib/client-api";

export default function EmailSettings() {
  const user = useRequiredUser();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const submit = async ev => {
    ev.preventDefault();
    if (isLoading) return;
    setError(null);
    setIsLoading(true);
    const data = new FormData(ev.target);
    try {
      const resp = await fetch("/api/auth/change-email", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({newEmail: data.get("email")}),
      });
      const json = await resp.json();
      setIsLoading(false);
      if (json.error) {
        const code = json.response?.code;
        const message = json.response?.messageError || "";
        setError(
          message.includes("AlreadyInUse") || code === "EMAIL_ALREADY_IN_USE" ? "Эта почта уже используется." :
          message.includes("InvalidEmail") || code === "INVALID_EMAIL" ? "Это не похоже на адрес электронной почты." :
          `Ошибка при изменении почты. Код: ${code || "?"}`
        );
        return;
      }
      setSuccess(true);
    } catch (e) {
      setIsLoading(false);
      setError("Сетевая ошибка. Попробуйте позже.");
    }
  };

  if (!user) return <Spinner className={classes.fullpageSpinner} />;

  return <FeedLayout
    list={<form onSubmit={submit}>
      <Head><title>Изменение e-mail | Bonfire</title></Head>
      {error && <NoticeCard title="Ошибка" content={error} />}
      {success && <NoticeCard title="Готово" content="Письмо отправлено на новый адрес. Подтвердите его, чтобы завершить смену." />}
      <InputLabel>
        Новый e-mail
        <Input type="email" name="email" autoComplete="email"
               placeholder="me@sit.sh" required disabled={isLoading} />
      </InputLabel>
      <div className={classes.buttons}>
        {!isLoading ?
          <Button type="submit" className={classes.buttonRight}>Поменять почту</Button> :
          <Spinner className={classes.spinner} />}
      </div>
    </form>}
  />;
}
