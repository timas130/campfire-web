import {useUser} from "../../lib/client-api";
import NoticeCard from "./NoticeCard";
import Link from "next/link";

export default function ChangeNicknameCard() {
  const user = useUser();

  if (!user) return null;
  if (!user.J_NAME.includes("#")) return null;

  return <NoticeCard
    title="Завершите регистрацию"
    content={<>
      Вы ещё не изменили свой ник! Людям будет сложно вас найти
      и запомнить, если вы не выберите ник.&nbsp;
      <Link href="/auth/register"><a>Изменить ник</a></Link>
    </>}
  />;
}
