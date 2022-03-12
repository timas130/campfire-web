import {ModalDialog} from "../../Modal";
import {useInfScroll} from "../../../lib/client-api";
import {FeedLoader} from "../../FeedLayout";
import FandomHeader from "../../FandomHeader";
import dayjs from "../../../lib/time";
import {KarmaCounter} from "../../Karma";

export default function KarmaVotesModel({id, open, setOpen}) {
  const {data, ref, showLoader} = useInfScroll(open && `/api/pub/${id}/karma`);
  return <ModalDialog open={open} setOpen={setOpen} title="Оценки" scrollable>
    {data && data.map(page => page.map(vote => (
      <FandomHeader
        key={vote.date} account={vote.anonymous ? null : vote.account}
        imageId={vote.anonymous ? 569232 : vote.account.J_IMAGE_ID}
        name={vote.anonymous ? "Аноним" : vote.account.J_NAME}
        link="#"
        author={dayjs(vote.date).locale("ru").calendar()}
        addRight={<KarmaCounter cof={vote.karmaCof} value={vote.karmaCount} mr />}
      />
    )))}
    {showLoader && <FeedLoader ref={ref} />}
  </ModalDialog>;
}
