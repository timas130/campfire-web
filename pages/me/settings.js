import {fetcher, useRequiredUser} from "../../lib/client-api";
import FeedLayout, {FeedLoader} from "../../components/FeedLayout";
import Head from "next/head";
import useSWR, {useSWRConfig} from "swr";
import FandomHeader from "../../components/FandomHeader";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faGoogle} from "@fortawesome/free-brands-svg-icons/faGoogle";
import {faEnvelope} from "@fortawesome/free-solid-svg-icons/faEnvelope";
import Tooltip from "../../components/Tooltip";
import classes from "../../styles/Settings.module.css";
import NoticeCard from "../../components/cards/NoticeCard";
import {useRouter} from "next/router";
import {useState} from "react";
import {faMicrophoneSlash} from "@fortawesome/free-solid-svg-icons/faMicrophoneSlash";
import Switch from "../../components/controls/Switch";
import Button from "../../components/controls/Button";
import Link from "next/link";
import {faUserLock} from "@fortawesome/free-solid-svg-icons/faUserLock";

function SwitchSetting({mutatingProp, settings, changeSetting, name, hint, icon, prop}) {
  return <FandomHeader
    el="div" onClick={() => {
      !mutatingProp && changeSetting(prop, !settings.settings[prop]);
    }}
    name={name}
    author={hint}
    addLeft={<FontAwesomeIcon icon={icon} />}
    dense addRight={<Switch
      value={settings.settings[prop]}
      setValue={value => !mutatingProp && changeSetting(prop, value)}
      loading={mutatingProp === prop}
    />}
  />;
}

export default function MySettings() {
  const user = useRequiredUser();
  const router = useRouter();

  const {mutate} = useSWRConfig();
  const {data: settings} = useSWR(user && "/api/user/settings");

  const [alertShown, setAlertShown] = useState(true);
  const [mutatingProp, setMutatingProp] = useState(null);

  const changeSetting = (prop, val) => {
    setMutatingProp(prop);
    return mutate("/api/user/settings", async settings => {
      const newSettings = {
        ...settings.settings,
        [prop]: val,
      };

      await fetcher("/api/user/settings", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          settings: newSettings,
        }),
      });

      return {...settings, settings: newSettings};
    }, false).finally(() => setMutatingProp(null));
  };

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
          content="Пароль на этом аккаунте был изменён."
        />}
        <h1 className={classes.smallerH1}>Настройки</h1>
        <NoticeCard
          title={"Безопасность"}
          content={<>
            <FandomHeader
              el="div"
              noLink
              name="E-mail"
              author={settings.security.email}
              addLeft={<FontAwesomeIcon icon={faEnvelope} />}
              addRight={settings.security.email &&
                <Link href="/me/settings/email" passHref legacyBehavior>
                  <Button el="a">Изменить</Button>
                </Link>}
              dense
            />
            {settings.security.email && <FandomHeader
              el="div"
              noLink
              name="Пароль"
              author={"••••••••"}
              addLeft={<FontAwesomeIcon icon={faUserLock} />}
              addRight={settings.security.email &&
                <Link href="/me/settings/password" passHref legacyBehavior>
                  <Button el="a">Изменить</Button>
                </Link>}
              dense
            />}
            <FandomHeader
              el="div"
              noLink
              name={<Tooltip text="Входить через Google можно только в приложении">Google</Tooltip>}
              author={settings.security.google ?
                `Вы вошли в Google. ID: ${settings.security.google}` :
                "Вы не вошли в Google"}
              addLeft={<FontAwesomeIcon icon={faGoogle} />}
              dense
            />
          </>}
        />
        <NoticeCard
          title={"Просмотр"}
          content={<>
            <SwitchSetting
              changeSetting={changeSetting} mutatingProp={mutatingProp} settings={settings}
              prop="anonRates"
              name={<Tooltip text="Когда вы будете ставить карму, никто не узнает кто её поставил">
                Ставить анонимные оценки
              </Tooltip>}
              hint={"Доступно с уровня 5.05"}
              icon={faMicrophoneSlash}
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
