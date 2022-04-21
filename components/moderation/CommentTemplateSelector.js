import {ModalDialog, ModalPortal} from "../Modal";
import classes from "../../styles/Moderation.module.css";
import {rulesConsts} from "../../pages/app/rules";
import FandomHeader from "../FandomHeader";

export function CommentTemplateSelector({isOpen, select}) {
  return isOpen && <ModalPortal>
    <ModalDialog close={() => select(null)} title="Выбор шаблона" scrollable>
      <div className={classes.content}>
        {rulesConsts.rules.map(rule => (rule.title !== "RP" &&
          <FandomHeader
            el="div"
            key={rule.title}
            name={rule.title}
            author={rule.rule}
            dense
            allowOverflow={2}
            onClick={() => select(rule.rule)}
          />
        ))}
      </div>
    </ModalDialog>
  </ModalPortal>;
}
