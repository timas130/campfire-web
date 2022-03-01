import {useRequiredUser} from "../../lib/client-api";
import FeedLayout, {FeedLoader} from "../../components/FeedLayout";
import Head from "next/head";
import useSWR from "swr";
import FandomHeader from "../../components/FandomHeader";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faGoogle} from "@fortawesome/free-brands-svg-icons/faGoogle";
import {faEnvelope} from "@fortawesome/free-solid-svg-icons/faEnvelope";
import Tooltip from "../../components/Tooltip";
import classes from "../../styles/Settings.module.css";
import {faUserLock} from "@fortawesome/free-solid-svg-icons/faUserLock";
import NoticeCard from "../../components/cards/NoticeCard";
import {useRouter} from "next/router";
import {useState} from "react";

export default function MySettings() {
  const user = useRequiredUser();
  const router = useRouter();

  const {data: settings} = useSWR(user && "/api/user/settings", {
    revalidateOnFocus: false,
  });

  const [alertShown, setAlertShown] = useState(true);

  if (!user) return <FeedLoader />;
  if (!settings) return <FeedLoader />;

  return <>
    <Head>
      <title>Настройки аккаунта | Campfire</title>
    </Head>
    <FeedLayout
      list={<div className={classes.padUp}>
        {router.query.state === "password_changed" && alertShown && <NoticeCard
          title={<>Пароль успешно изменён. <a href="#" onClick={() => setAlertShown(false)}>Закрыть</a></>}
          content="Пароль на этом аккаунте был изменён. Его надо будет вводить снова в приложении."
        />}
        <h1 className={classes.smallerH1}>Настройки</h1>
        <NoticeCard
          title={"Безопасность"}
          content={<>
            <FandomHeader
              el="div" link="/me/settings/password" name="Email"
              author={settings.security.email}
              addLeft={<FontAwesomeIcon icon={faEnvelope} />}
              dense
            />
            <FandomHeader
              el="div" onClick={() => {}}
              name={<Tooltip text="Входить через Google можно только в приложении">Google</Tooltip>}
              author={settings.security.google ?
                `Вы вошли в Google. ID: ${settings.security.google}` :
                "Вы не вошли в Google"}
              addLeft={<FontAwesomeIcon icon={faGoogle} />}
              dense
            />
            <FandomHeader
              el="div" link="/me/settings/password"
              name="Изменить пароль"
              addLeft={<FontAwesomeIcon icon={faUserLock} />}
              dense
            />
          </>}
        />
      </div>}
      sidebar={<div className={classes.padUp}>
        <NoticeCard
          title="Разработчики"
          content={<div className={classes.developers}>
            <FandomHeader
              imageId={1} link="/account/Zeon" name="Zeon"
              allowOverflow={0b10} noPadding
              author="Разработчик сервера и приложения, изначальный создатель"
            />
            <FandomHeader
              imageId={1121516} link="/account/sit" name="sitting33"
              allowOverflow={0b10} noPadding
              author="Разработчик веб-версии, иногда дорабатывает приложение и сервер"
            />
          </div>}
        />
      </div>}
    />
  </>;
}
