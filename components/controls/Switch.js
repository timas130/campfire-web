import classes from "../../styles/Input.module.css";
import classNames from "classnames";
import Spinner from "../Spinner";

export default function Switch({value, loading, setValue}) {
  return <label className={classes.switch} tabIndex={0} onClick={ev => ev.stopPropagation()}>
    <input className={classes.switchCheckbox} type="checkbox" checked={value || false}
           onChange={ev => setValue && setValue(ev.target.checked)} />
    <span className={classNames(classes.switchSlider, loading && classes.loading)}>
      <Spinner className={classNames(classes.loadingSpinner)} />
    </span>
  </label>;
}
