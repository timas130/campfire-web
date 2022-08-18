import EventBase from "./EventBase";
import {useMemo} from "react";
import dynamic from "next/dynamic";
import {AccountLink, ShortAccountLink} from "../../FandomHeader";
import dayjs from "../../../lib/time";
import FormattedText from "../../FormattedText";
import Link from "next/link";
import classes from "../../../styles/Post.module.css";
import {getQuest} from "../../DailyQuest";

const mapper = {
  1: EventUserAchievement,
  3: EventUserFandomSuggest,
  33: EventUserUnknown,
  34: EventUserAdminBanned,
  35: EventUserAdminWarned,
  36: EventUserNameChanged,
  37: EventUserRemovePunishment,
  38: EventUserRemoveDescription,
  39: EventUserRemoveLink,
  40: EventUserRemoveStatus,
  41: EventUserRemoveImage,
  42: EventUserRemoveName,
  43: EventUserRemoveTitleImage,
  44: EventUserFandomMakeModerator,
  45: EventUserFandomRemoveModerator,
  46: EventUserAdminModerationRejected,
  47: EventUserAdminPublicationRestored,
  50: EventUserAdminPostChangeFandom,
  51: EventUserAdminPublicationBlocked,
  52: EventUserQuestFinish,
  53: EventUserAdminViceroyAssign,
  54: EventUserAdminViceroyRemove,
  55: EventUserEffectAdd,
  56: EventUserEffectRemove,
  57: EventUserTranslateRejected,
  58: EventUserAdminPostRemoveMedia,
  59: EventUserAdminVoteCancelledForAdmin,
  60: EventUserAdminVoteCancelledForUser,
};

function usePub(pub) {
  return useMemo(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    if (typeof pub === "string") pub = JSON.parse(pub);
    if (typeof pub.jsonDB === "string") pub.jsonDB = JSON.parse(pub.jsonDB);
    return pub;
  }, [pub]);
}

function useAdmin(pub) {
  return useMemo(() => {
    return {
      J_ID: pub.jsonDB.event.adminAccountId,
      J_NAME: pub.jsonDB.event.adminAccountName,
      J_IMAGE_ID: pub.jsonDB.event.adminAccountImageId || 419805,
    };
  }, [pub.jsonDB.event]);
}

const AchievementName = dynamic(() => import("./achievements").then(a => a.default));

function EventUserAchievement({pub}) {
  return <EventBase
    pub={pub}
    account={pub.creator}
    title={`Получен ${pub.jsonDB.event.achievementLvl} уровень достижения`}
    subtitle={<AchievementName id={pub.jsonDB.event.achievementIndex} />}
  />;
}

function EventUserFandomSuggest({pub}) {
  return <EventBase
    pub={pub}
    account={pub.creator}
    icon={pub.jsonDB.event.fandomImageId}
    title={<>
      <AccountLink account={pub.creator} /> предложил(-а)
      фэндом <Link href={`/fandom/${pub.jsonDB.event.fandomId}`}>
        <a>{pub.jsonDB.event.fandomName}</a>
      </Link>
    </>}
  />;
}

function EventUserAdminBanned({pub}) {
  return <EventBase
    pub={pub}
    account={useAdmin(pub)}
    title={<>
      <ShortAccountLink name={pub.jsonDB.event.adminAccountName} /> забанил(-а)&nbsp;
      <AccountLink account={pub.creator} /> до&nbsp;
      {dayjs(pub.jsonDB.event.blockDate).calendar()}
    </>}
    subtitle={<>
      Причина: <FormattedText text={pub.jsonDB.event.comment} />
    </>}
  />;
}

function EventUserAdminWarned({pub}) {
  return <EventBase
    pub={pub}
    account={useAdmin(pub)}
    title={<>
      <ShortAccountLink name={pub.jsonDB.event.adminAccountName} /> предупредил(-а)&nbsp;
      <AccountLink account={pub.creator} />
    </>}
    subtitle={<>
      Причина: <FormattedText text={pub.jsonDB.event.comment} />
    </>}
  />;
}

function EventUserNameChanged({pub}) {
  return <EventBase
    pub={pub}
    account={useAdmin(pub)}
    title={<>
      <ShortAccountLink name={pub.jsonDB.event.adminAccountName} /> изменил(-а) имя
      с {pub.jsonDB.event.oldName} на {pub.jsonDB.event.ownerAccountName}
    </>}
    subtitle={<>
      Причина: <FormattedText text={pub.jsonDB.event.comment} />
    </>}
  />;
}

function EventUserRemovePunishment({pub}) {
  return <EventBase
    pub={pub}
    account={useAdmin(pub)}
    title={<>
      <ShortAccountLink name={pub.jsonDB.event.adminAccountName} /> убрал(-а) наказание
      пользователя <ShortAccountLink name={pub.jsonDB.event.ownerAccountName} />
    </>}
    subtitle={<>
      Причина: <FormattedText text={pub.jsonDB.event.comment} />
    </>}
  />;
}

function EventUserRemoveDescription({pub}) {
  return <EventBase
    pub={pub}
    account={useAdmin(pub)}
    title={<>
      <ShortAccountLink name={pub.jsonDB.event.adminAccountName} /> очистил(-а) описание
      профиля <ShortAccountLink name={pub.jsonDB.event.ownerAccountName} />
    </>}
    subtitle={<>
      Причина: <FormattedText text={pub.jsonDB.event.comment} />
    </>}
  />;
}

function EventUserRemoveLink({pub}) {
  return <EventBase
    pub={pub}
    account={useAdmin(pub)}
    title={<>
      <ShortAccountLink name={pub.jsonDB.event.adminAccountName} /> удалил(-а) ссылку в
      профиле <ShortAccountLink name={pub.jsonDB.event.ownerAccountName} />
    </>}
    subtitle={<>
      Причина: <FormattedText text={pub.jsonDB.event.comment} />
    </>}
  />;
}

function EventUserRemoveStatus({pub}) {
  return <EventBase
    pub={pub}
    account={useAdmin(pub)}
    title={<>
      <ShortAccountLink name={pub.jsonDB.event.adminAccountName} /> очистил(-а)
      статус профиля <ShortAccountLink name={pub.jsonDB.event.ownerAccountName} />
    </>}
    subtitle={<>
      Причина: <FormattedText text={pub.jsonDB.event.comment} />
    </>}
  />;
}

function EventUserRemoveImage({pub}) {
  return <EventBase
    pub={pub}
    account={useAdmin(pub)}
    title={<>
      <ShortAccountLink name={pub.jsonDB.event.adminAccountName} /> удалил(-а)
      аватар <ShortAccountLink name={pub.jsonDB.event.ownerAccountName} />
    </>}
    subtitle={<>
      Причина: <FormattedText text={pub.jsonDB.event.comment} />
    </>}
  />;
}

function EventUserRemoveName({pub}) {
  return <EventBase
    pub={pub}
    account={useAdmin(pub)}
    title={<>
      <ShortAccountLink name={pub.jsonDB.event.adminAccountName} /> очистил(-а)
      имя <ShortAccountLink name={pub.jsonDB.event.ownerAccountName} />
    </>}
    subtitle={<>
      Причина: <FormattedText text={pub.jsonDB.event.comment} />
    </>}
  />;
}

function EventUserRemoveTitleImage({pub}) {
  return <EventBase
    pub={pub}
    account={useAdmin(pub)}
    title={<>
      <ShortAccountLink name={pub.jsonDB.event.adminAccountName} /> удалил(-а) фоновое изображение
      профиля <ShortAccountLink name={pub.jsonDB.event.ownerAccountName} />
    </>}
    subtitle={<>
      Причина: <FormattedText text={pub.jsonDB.event.comment} />
    </>}
  />;
}

function EventUserFandomMakeModerator({pub}) {
  return <EventBase
    pub={pub}
    account={useAdmin(pub)}
    title={<>
      <ShortAccountLink name={pub.jsonDB.event.adminAccountName} /> сделал(-а)&nbsp;
      <ShortAccountLink name={pub.jsonDB.event.ownerAccountName} /> модератором
      фэндома <Link href={`/fandom/${pub.jsonDB.event.fandomId}`}>
        <a>{pub.jsonDB.event.fandomName}</a>
      </Link>
    </>}
    subtitle={<>
      Причина: <FormattedText text={pub.jsonDB.event.comment} />
    </>}
  />;
}

function EventUserFandomRemoveModerator({pub}) {
  return <EventBase
    pub={pub}
    account={useAdmin(pub)}
    title={<>
      <ShortAccountLink name={pub.jsonDB.event.adminAccountName} /> забрал(-а) модераторские
      права у <ShortAccountLink name={pub.jsonDB.event.ownerAccountName} /> в
      фэндоме <Link href={`/fandom/${pub.jsonDB.event.fandomId}`}>
        <a>{pub.jsonDB.event.fandomName}</a>
      </Link>
    </>}
    subtitle={<>
      Причина: <FormattedText text={pub.jsonDB.event.comment} />
    </>}
  />;
}

function EventUserAdminModerationRejected({pub}) {
  return <EventBase
    pub={pub}
    account={useAdmin(pub)}
    title={<>
      <ShortAccountLink name={pub.jsonDB.event.adminAccountName} /> отклонил(-а)
      модерацию <ShortAccountLink name={pub.jsonDB.event.ownerAccountName} /> в
      фэндоме <Link href={`/fandom/${pub.jsonDB.event.fandomId}`}>
        <a>{pub.jsonDB.event.fandomName}</a>
      </Link>
    </>}
    subtitle={<>
      Ссылка на действие: <Link href={`/mod/${pub.jsonDB.event.moderationId}`}>
        <a>@moderation-{pub.jsonDB.event.moderationId}</a>
      </Link><br />
      Причина: <FormattedText text={pub.jsonDB.event.comment} />
    </>}
  />;
}

function EventUserAdminPublicationRestored({pub}) {
  return <EventBase
    pub={pub}
    account={useAdmin(pub)}
    title={<>
      <ShortAccountLink name={pub.jsonDB.event.adminAccountName} /> восстановил(-а)
      публикацию <ShortAccountLink name={pub.jsonDB.event.ownerAccountName} />
    </>}
    subtitle={<>
      Ссылка на блокировку: <Link href={`/mod/${pub.jsonDB.event.moderationId}`}>
        <a>@moderation-{pub.jsonDB.event.moderationId}</a>
      </Link><br />
      Причина: <FormattedText text={pub.jsonDB.event.comment} />
    </>}
  />;
}

function EventUserAdminPostChangeFandom({pub}) {
  return <EventBase
    pub={pub}
    account={useAdmin(pub)}
    title={<>
      <ShortAccountLink name={pub.jsonDB.event.adminAccountName} /> переместил(-а)
      пост <ShortAccountLink name={pub.jsonDB.event.ownerAccountName} /> из
      фэндома <Link href={`/fandom/${pub.jsonDB.event.oldFandomId}`}>
        <a>{pub.jsonDB.event.oldFandomName}</a>
      </Link> в
      фэндом <Link href={`/fandom/${pub.jsonDB.event.newFandomId}`}>
        <a>{pub.jsonDB.event.newFandomName}</a>
      </Link>
    </>}
    subtitle={<>
      Ссылка на пост: <Link href={`/post/${pub.jsonDB.event.unitId}`}>
        <a>@post-{pub.jsonDB.event.unitId}</a>
      </Link><br />
      {pub.jsonDB.event.newLanguageId !== pub.jsonDB.event.oldLanguageId && <>
        Примечание: язык поста был изменён.
      </>}
      Причина: <FormattedText text={pub.jsonDB.event.comment} />
    </>}
  />;
}

function EventUserAdminPublicationBlocked({pub}) {
  return <EventBase
    pub={pub}
    account={useAdmin(pub)}
    title={<>
      <ShortAccountLink name={pub.jsonDB.event.adminAccountName} /> заблокировал(-а)
      публикацию <ShortAccountLink name={pub.jsonDB.event.ownerAccountName} /> в
      фэндоме <Link href={`/fandom/${pub.jsonDB.event.blockFandomId}`}>
        <a>{pub.jsonDB.event.blockFandomName}</a>
      </Link>
    </>}
    subtitle={<>
      <div className={classes.eventContent}>
        Полная версия: <Link href={`/mod/${pub.jsonDB.event.moderationId}`}>
          <a>@moderation-{pub.jsonDB.event.moderationId}</a>
        </Link><br />
      </div>
      {pub.jsonDB.event.blockAccountDate > 0 && <div className={classes.eventContent}>
        Пользователь заблокирован
        до {dayjs(pub.jsonDB.event.blockAccountDate).locale("ru").calendar()}
        {pub.jsonDB.event.blockedInApp && " во всём приложении"}
      </div>}
      {pub.jsonDB.event.warned && <div className={classes.eventContent}>
        Пользователь предупреждён.
      </div>}
      {pub.jsonDB.event.lastPublicationsBlocked && <div className={classes.eventContent}>
        Последние публикации пользователя заблокированы.
      </div>}
      <div className={classes.eventContent}>
        Причина: <FormattedText text={pub.jsonDB.event.comment} />
      </div>
    </>}
  />;
}

function EventUserQuestFinish({pub}) {
  return <EventBase
    pub={pub}
    account={pub.creator}
    title="Ежедневный квест завершён"
    subtitle={getQuest(pub.jsonDB.event.questIndex, pub.creator.J_LVL).text}
  />;
}

function EventUserAdminViceroyAssign({pub}) {
  return <EventBase
    pub={pub}
    account={useAdmin(pub)}
    title={<>
      <ShortAccountLink name={pub.jsonDB.event.adminAccountName} /> назначил(-а)&nbsp;
      <ShortAccountLink name={pub.jsonDB.event.ownerAccountName} /> наместником
      фэндома <Link href={`/fandom/${pub.jsonDB.event.fandomId}`}>
        <a>{pub.jsonDB.event.fandomName}</a>
      </Link>
    </>}
    subtitle={<>
      Причина: <FormattedText text={pub.jsonDB.event.comment} />
    </>}
  />;
}

function EventUserAdminViceroyRemove({pub}) {
  return <EventBase
    pub={pub}
    account={useAdmin(pub)}
    title={<>
      <ShortAccountLink name={pub.jsonDB.event.adminAccountName} /> забрал(-а) права наместника
      у <ShortAccountLink name={pub.jsonDB.event.ownerAccountName} /> в
      фэндоме <Link href={`/fandom/${pub.jsonDB.event.fandomId}`}>
        <a>{pub.jsonDB.event.fandomName}</a>
      </Link>
    </>}
    subtitle={<>
      Причина: <FormattedText text={pub.jsonDB.event.comment} />
    </>}
  />;
}

const effects = {
  1: "Проклятие хейтера",
  2: "Проклятие свиньи",
  3: "Проклятие вахтера",
  4: "Проклятие гуся",
  5: "Проклятие вечной зимы",
  6: "Наказан",
  7: "Переводчик",
  8: "Пальцы на полке",
};

function EventUserEffectAdd({pub}) {
  // TODO: MAccountEffect.{tag,commentTag}
  return <EventBase
    pub={pub}
    account={useAdmin(pub)}
    title={<>
      <ShortAccountLink name={pub.jsonDB.event.adminAccountName || "Система"} /> наложил(-а)
      эффект &quot;{effects[pub.jsonDB.event.mAccountEffect.effectIndex]}&quot;
      на <ShortAccountLink name={pub.jsonDB.event.ownerAccountName} />
    </>}
    subtitle={pub.jsonDB.event.comment && <>Причина: <FormattedText text={pub.jsonDB.event.comment} /></>}
  />;
}

function EventUserEffectRemove({pub}) {
  return <EventBase
    pub={pub}
    account={useAdmin(pub)}
    title={<>
      <ShortAccountLink name={pub.jsonDB.event.adminAccountName || "Система"} /> снял(-а)
      эффект &quot;{effects[pub.jsonDB.event.effectIndex]}&quot;
      с <ShortAccountLink name={pub.jsonDB.event.ownerAccountName} />
    </>}
    subtitle={pub.jsonDB.event.comment && <>Причина: <FormattedText text={pub.jsonDB.event.comment} /></>}
  />;
}

function EventUserTranslateRejected({pub}) {
  return <EventBase
    pub={pub}
    account={useAdmin(pub)}
    title={<>
      <ShortAccountLink name={pub.jsonDB.event.adminAccountName} /> отклонил(-а)
      перевод <ShortAccountLink name={pub.jsonDB.event.ownerAccountName} />
    </>}
    subtitle={<>
      Причина: <FormattedText text={pub.jsonDB.event.comment} />
    </>}
  />;
}

function EventUserAdminPostRemoveMedia({pub}) {
  return <EventBase
    pub={pub}
    account={useAdmin(pub)}
    title={<>
      <ShortAccountLink name={pub.jsonDB.event.adminAccountName} /> удалил(-а)
      все медиа из поста <ShortAccountLink name={pub.jsonDB.event.ownerAccountName} />
    </>}
    subtitle={<>
      Ссылка на пост: <Link href={`/post/${pub.jsonDB.event.unitId}`}>
        <a>@post_{pub.jsonDB.event.unitId}</a>
      </Link><br />
      Причина: <FormattedText text={pub.jsonDB.event.comment} />
    </>}
  />;
}

// haha cancelled
function EventUserAdminVoteCancelledForAdmin({pub}) {
  return <EventBase
    pub={pub}
    account={useAdmin(pub)}
    title={<>
      <ShortAccountLink name={pub.jsonDB.event.adminAccountName} /> отклонил(-а)
      действие <ShortAccountLink name={pub.jsonDB.event.ownerAccountName} />
    </>}
    subtitle={<>
      TODO
    </>}
  />;
}

function EventUserAdminVoteCancelledForUser({pub}) {
  return <EventBase
    pub={pub}
    account={useAdmin(pub)}
    title={<>
      <ShortAccountLink name={pub.jsonDB.event.adminAccountName} /> отклонил(-а)
      действие <ShortAccountLink name={pub.jsonDB.event.ownerAccountName} /> над
      пользователем
    </>}
    subtitle={<>
      TODO
    </>}
  />;
}

function EventUserUnknown({pub}) {
  return <EventBase
    pub={pub}
    account={pub.creator}
    title="Неизвестное событие"
    subtitle={"Рано или поздно это починят. Тип: " + pub.jsonDB.event.type}
  />;
}

export default function EventUser({pub: pubL, ...rest}) {
  const pub = usePub(pubL);

  const El = mapper[pub.jsonDB.event.type] || EventUserUnknown;
  return <El pub={pub} {...rest} />;
}
