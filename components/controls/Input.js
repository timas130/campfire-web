import classes from "../../styles/Input.module.css";
import classNames from "classnames";

function Input(props) {
  const El = props.el || "input";
  return <El
    {...props}
    className={classNames(classes.input, props.className)}
  />;
}

export default Input;
