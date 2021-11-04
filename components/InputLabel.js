import classes from "../styles/Input.module.css";
import classNames from "classnames";

function InputLabel(props) {
  const {children, horizontal, block, className, ...rest} = props;
  return <label className={classNames(
    classes.label,
    horizontal && classes.horizontal,
    block && classes.block,
    className
  )} {...rest}>
    {children}
  </label>;
}

export default InputLabel;
