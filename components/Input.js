import classes from "../styles/Input.module.css";

function Input(props) {
  return <input
    className={classes.input}
    {...props}
  />;
}

export default Input;
