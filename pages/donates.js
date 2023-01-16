import FeedLayout, {FeedLoader} from "../components/FeedLayout";
import NoticeCard from "../components/cards/NoticeCard";
import FeedTypeSelectorCard from "../components/cards/FeedTypeSelectorCard";
import {useMemo, useState} from "react";
import Head from "next/head";
import {useInfScroll} from "../lib/client-api";
import FandomHeader from "../components/FandomHeader";
import classes from "../styles/Card.module.css";
import useSWR from "swr";
import classNames from "classnames";
import FormattedText from "../components/FormattedText";

export default function DonatesPage() {
  const [donatesType, setDonatesType] = useState("month");
  const {data: pages, ref, showLoader} = useInfScroll(`/api/project/donates/list?type=${donatesType}`);
  const {data: donatesMonth = {}} = useSWR("/api/project/donates");
  const donates = pages.flat();

  const sum = useMemo(() => {
    return donates.reduce((p, c) => p + c.sum, 0);
  }, [donates]);

  return <FeedLayout list={<>
    <Head>
      <title>Пожертвования в Campfire</title>
    </Head>
    <FeedTypeSelectorCard types={{
      month: "За этот месяц",
      all: "За всё время",
    }} type={donatesType} setType={setDonatesType} />
    <NoticeCard
      title={<div className={classes.donateHeader}>
        Донаты
        <div className={classNames(classes.donateRight, classes.donateSum)}>
          Всего: {((donatesType === "month" ? (donatesMonth.totalCount || 0) : sum) / 100).toFixed(2) + " ₽"}
        </div>
      </div>}
      content={<>
        {donates.map((donate, idx) => <FandomHeader
          className={classes.donateItem}
          key={idx} dense account={donate.account}
          author={donatesType === "all" ? `#${idx + 1}` : donate.comment}
          addRight={<span className={classes.donateSum}>
            {(donate.sum / 100).toFixed(2)} ₽
          </span>}
        />)}
        {showLoader && <FeedLoader ref={ref} />}
      </>}
    />
  </>} staticSidebar={<>
    <NoticeCard
      title="Пожертвования"
      content={<FormattedText text={
        "Campfire существует без рекламы или каких-либо платных функций. " +
        "Таким его держать требует денег, поэтому все будут очень рады даже " +
        "небольшому донату от пользователей. \n\n" +
        "Сделать пожертвование в Campfire возможно только из приложения."
      } />}
    />
  </>} />;
}
