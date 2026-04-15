import classes from "../../../../styles/Page.module.css";
import CImage from "../../../CImage";

export default function ImagesPage({ page }) {
  // Prefer ImageRef[] from `images`. Old posts may only have `imagesIds`
  // (Long[] or legacy JSON-string). `imageIdArray` is the new-backend Long[]
  // that parallels `images`; fall through to `imagesIds` for pre-migration
  // legacy data.
  const refs = Array.isArray(page.images) ? page.images : null;
  const idsRaw = page.imageIdArray || page.imagesIds;
  const ids = typeof idsRaw === "string" ? JSON.parse(idsRaw) : (idsRaw || []);
  const count = refs ? refs.length : ids.length;

  return <div className={classes.imagesPage}>
    {Array.from({length: count}).map((_, idx) => {
      const ref = refs?.[idx];
      const id = ids[idx];
      return <div className={classes.imagesImage} key={ref?.u || id || idx}>
        <CImage
          ref={ref} id={id}
          layout="fill" alt="Изображение" objectFit="cover" modal
        />
      </div>;
    })}
  </div>;
}
