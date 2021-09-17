import classes from "../styles/Input.module.css";
import classNames from "classnames";

function InputLabel(props) {
  const {children, horizontal} = props;
  return <label className={classNames(classes.label, horizontal && classes.horizontal)}>
    {children}
  </label>;
}

export default InputLabel;
