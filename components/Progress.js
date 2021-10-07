import classes from "../styles/Progress.module.css";

export default function Progress({ value, max }) {
  return <div className={classes.progress}>
    <div className={classes.progressComplete} style={{
      width: (value / max * 100).toFixed() + "%"
    }} />
  </div>;
}
