import classes from "../../../../styles/Page.module.css";
import CImage from "../../../CImage";

export default function ImagesPage({ page }) {
  // TODO: ImagesPage
  const images = typeof page.imagesIds === "string" ? JSON.parse(page.imagesIds) : page.imagesIds;
  return <div className={classes.imagesPage}>
    {images.map(image => <div className={classes.imagesImage} key={image}>
      <CImage id={image} layout="fill" alt="Изображение" objectFit="cover" modal />
    </div>)}
  </div>;
}
