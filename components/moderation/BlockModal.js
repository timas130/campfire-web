import {ModalDialog, ModalPortal} from "../Modal";
import {ConfirmButton, useModeration} from "./PostModeration";
import classes from "../../styles/Moderation.module.css";
import InputLabel from "../controls/InputLabel";
import Input from "../controls/Input";
import Switch from "../controls/Switch";
import FandomHeader from "../FandomHeader";
import {BanIcon, ChevronDownIcon, DocumentTextIcon, ScaleIcon, ShieldExclamationIcon} from "@heroicons/react/solid";
import {useState} from "react";
import Button from "../controls/Button";
import useSWR from "swr";
import {adminCan} from "./consts";
import Spinner from "../Spinner";
import {fetcher} from "../../lib/client-api";
import {showButtonToast, showErrorToast} from "../../lib/ui";
import {CommentTemplateSelector} from "./CommentTemplateSelector";

export default function BlockModal() {
  const mod = useModeration();
  const {data: settings} = useSWR("/api/user/settings");
  const [blockHour, setBlockHour] = useState(false);
  const [punishment, _setPunishment] = useState("none");
  const [banAuthor, _setBanAuthor] = useState(false);
  const [comment, setComment] = useState("");
  const [templateSelectorOpen, setTemplateSelectorOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const setBanAuthor = value => {
    _setBanAuthor(value);
    if (value && (punishment === "none" || punishment === "warn")) {
      setPunishment("1h");
    }
  };
  const setPunishment = value => {
    _setPunishment(value);
    if (value === "nona" || value === "warn") {
      _setBanAuthor(false);
    }
  };

  const submit = ev => {
    if (isLoading) return;
    setIsLoading(true);
    fetcher("/api/mod/block", {
      method: "POST",
      headers: {"content-type": "application/json"},
      body: JSON.stringify({
        unitId: mod.pub.id,
        blockTime:
          punishment === "none" ? 0 :
          punishment === "warn" ? -1 :
          punishment === "1h" ? 1000 * 3600 :
          punishment === "9h" ? 1000 * 3600 * 9 :
          punishment === "1d" ? 1000 * 3600 * 24 :
          punishment === "1w" ? 1000 * 3600 * 24 * 7 :
          punishment === "1M" ? 1000 * 3600 * 24 * 30 :
          punishment === "6M" ? 1000 * 3600 * 24 * 30 * 6 :
          punishment === "1y" ? 1000 * 3600 * 24 * 365 :
          0,
        blockLastUnits: blockHour,
        comment,
        blockInApp: banAuthor,
        userLanguageId: 2,
      }),
    })
      .then(() => {
        showButtonToast(ev.target, "Заблокировано!", null, 3000);
        mod.setTypeOpen(null);
      })
      .catch(e => {
        setIsLoading(false);
        showErrorToast(ev.target, e);
      });
  };

  return mod.typeOpen === "block" && <ModalPortal>
    <ModalDialog close={() => mod.setTypeOpen(null)} title="Блокировка публикации">
      <CommentTemplateSelector isOpen={templateSelectorOpen} select={comment => {
        setTemplateSelectorOpen(false);
        comment && setComment(comment);
      }} />
      <div className={classes.content}>
        <FandomHeader
          el="div"
          name="Удалить последние"
          author="Заблокировать публикации пользователя за последний час"
          addLeft={<BanIcon />}
          dense
          allowOverflow={2}
          onClick={() => setBlockHour(a => !a)}
          addRight={<Switch value={blockHour} setValue={setBlockHour} />}
        />
        <FandomHeader
          el="div"
          name="Наказание"
          addLeft={<ScaleIcon />}
          dense
          allowOverflow={2}
          onClick={() => {}}
          author={<Input el="select" className={classes.fandomInput}
                         value={punishment} onChange={ev => setPunishment(ev.target.value)}>
            <option value="none">Не наказывать</option>
            <option value="warn">Предупреждение</option>
            <option value="1h">Блокировка: час</option>
            <option value="9h">Блокировка: 9 часов</option>
            <option value="1d">Блокировка: день</option>
            <option value="1w">Блокировка: неделя</option>
            <option value="1M">Блокировка: месяц</option>
            <option value="6M">Блокировка: 6 месяцев</option>
            <option value="1y">Блокировка: 12 месяцев</option>
          </Input>}
        />
        {/* TODO: test admin ban on a local server */}
        {adminCan(settings, "ban") && <FandomHeader
          el="div"
          name="Забанить"
          author="Заблокировать автора во всём приложении"
          addLeft={<ShieldExclamationIcon />}
          dense
          allowOverflow={2}
          onClick={() => setBanAuthor(!banAuthor)}
          addRight={<Switch value={banAuthor} setValue={setBanAuthor} />}
        />}
        <FandomHeader
          el="div"
          name="Комментарий:"
          addLeft={<DocumentTextIcon />}
          dense
          allowOverflow={2}
          onClick={() => {}}
          author={
            <InputLabel>
              <div className={classes.inputRow}>
                <Input el="textarea" value={comment} onChange={ev => setComment(ev.target.value)} />
                <ChevronDownIcon
                  tabIndex={0} onClick={() => setTemplateSelectorOpen(true)}
                />
              </div>
            </InputLabel>
          }
        />
        <div className={classes.bottomRow}>
          <Button onClick={() => mod.setTypeOpen(null)}>Отмена</Button>
          <ConfirmButton className={classes.submitButton} onClick={submit}>
            {isLoading && <Spinner />}
            Заблокировать
          </ConfirmButton>
        </div>
      </div>
    </ModalDialog>
  </ModalPortal>;
}
