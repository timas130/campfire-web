import CImage from "../../CImage";
import classes from "../../../styles/Page.module.css";

export default function ImagePage({ page }) {
  return <div className={classes.imagePage}>
    <CImage
      id={page["J_IMAGE_ID"]}
      w={page["J_W"]}
      h={page["J_H"]}
      loading="lazy"
    />
  </div>;
}
