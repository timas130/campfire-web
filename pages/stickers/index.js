import {useInfScroll} from "../../lib/client-api";
import FeedLayout, {FeedLoader} from "../../components/FeedLayout";
import Head from "next/head";
import {StickerPackCard} from "./[id]";
import NoticeCard from "../../components/cards/NoticeCard";

export default function StickersPage() {
  const {data, showLoader, ref} = useInfScroll("/api/stickers");

  return <FeedLayout
    list={<>
      <Head>
        <title>Стикеры в Campfire</title>
      </Head>
      {data.map(page => page.map(info => <StickerPackCard key={info.id} info={info} />))}
      {showLoader && <FeedLoader ref={ref} />}
    </>}
    staticSidebar={<NoticeCard
      title="Стикеры"
      content={
        "Стикеры — картинки, которые можно быстро вставить в комментарий или сообщение в чат. " +
          "Создайте свой стикерпак или добавьте в свою коллекцию наборы от других пользователей."
      }
    />}
  />;
}
