import classes from "../../../../styles/Page.module.css";
import postClasses from "../../../../styles/Post.module.css";
import {CAvatar} from "../../../CImage";
import Link from "next/link";
import dayjs from "../../../../lib/time";
import {useState} from "react";
import {fetcher, useInterval, useUser} from "../../../../lib/client-api";
import Button from "../../../controls/Button";
import classNames from "classnames";
import FandomHeader from "../../../FandomHeader";

export function Countdown({timestamp}) {
  const [,setDate] = useState(null);
  useInterval(() => {
    setDate(Date.now());
  }, 1000);

  return dayjs(timestamp).locale("ru").calendar();
}

export default function UserActivityPage({page, full = false}) {
  const user = useUser();
  const [myMemberStatus, setMyMemberStatus] = useState(page.myMemberStatus);
  const [currentAccount, setCurrentAccount] = useState(page.currentAccount);
  // time when the activity was relayed. named tag2 here for consistency.
  const [tag2, setTag2] = useState(page.tag_2);

  const changeMemberStatus = () => {
    if (myMemberStatus === 1) {
      if (currentAccount.J_ID === user.J_ID) {
        fetcher(`/api/activity/${page.id}/reject`)
          .then(resp => {
            setMyMemberStatus(0);
            console.log(resp);
            setCurrentAccount(resp.currentAccount);
            setTag2(resp.currentOwnerTime);
          })
          .catch(e => alert("Ошибка: " + e));
      } else {
        fetcher(`/api/activity/${page.id}/member?member=false`)
          .then(() => setMyMemberStatus(0))
          .catch(e => alert("Ошибка: " + e));
      }
    } else {
      fetcher(`/api/activity/${page.id}/member?member=true`)
        .then(resp => {
          setMyMemberStatus(1);
          if (resp.myIsCurrentMember) {
            setCurrentAccount(user);
            setTag2(Date.now() / 1000);
          }
        })
        .catch(e => alert("Ошибка: " + e));
    }
  };

  return <section className={classNames(classes.activity, full && classes.activityFull)}>
    <FandomHeader
      link={`/activity/${page.id}`} imageId={page.fandom.imageId}
      name={page.name} authorLink={`/fandom/${page.fandom.id}`}
      author={page.fandom.name} className={classes.activitySection}
    />
    <div className={classes.activityDescription}>
      {page.description}
    </div>
    <div className={classes.activitySection}>
      {currentAccount.J_ID !== 0 && <CAvatar account={currentAccount} />}
      <div className={postClasses.headerText}>
        <div className={postClasses.headerTitle}>
          <span className={postClasses.headerAuthor}>
            Следующий:&nbsp;
          </span>
          {currentAccount.J_ID !== 0 ? <Link href={`/account/${encodeURIComponent(currentAccount.J_NAME)}`}>
            <a className={classes.activityNext}>{currentAccount.J_NAME}</a>
          </Link> : <span className={classes.activityNext}>никто</span>}
        </div>
        {currentAccount.J_ID !== 0 ? <div className={classes.activityDue}>
          <span className={postClasses.headerAuthor}>истекает&nbsp;</span>
          <Countdown timestamp={tag2 + 3600000 * 24} />
        </div> : <div className={classes.activityDue}>
          Продолжите эстафету!
        </div>}
      </div>
    </div>
    <div className={classes.activityButtons}>
      <Link href={`/activity/${page.id}`} passHref>
        <Button el="a" noBackground>
          Все посты
        </Button>
      </Link>
      {/* fun fucking fact: the server allows double participation in an activity! */}
      {user && page.myPostId === 0 && <Button secondary onClick={changeMemberStatus}>
        {myMemberStatus === 1 ?
          currentAccount.J_ID === user.J_ID ?
            "Отказаться" :
            "Не участвовать" :
          "Принять участие"}
      </Button>}
    </div>
  </section>;
}
