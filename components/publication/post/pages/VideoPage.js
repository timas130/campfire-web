import {useState} from "react";
import classes from "../../../../styles/Page.module.css";
import Button from "../../../controls/Button";

export default function VideoPage({page}) {
  const [shown, setShown] = useState(false);

  if (!shown) {
    return <div className={classes.videoPage}>
      <div className={classes.videoHidden}>
        <div className={classes.videoPageHeadline}>Видео скрыто</div>
        <div className={classes.videoPageText}>
          {/* Thanks, DDG! */}
          YouTube (которым владеет Google) не позволяет смотреть вам видео
          анонимно. Таким образом, просмотр YouTube видео здесь будет
          прослеживаться YouTube или Google.
        </div>
        <div>
          <Button secondary onClick={() => setShown(true)} className={classes.left}>
            Смотреть тут
          </Button>
          <Button
            el="a"
            rel="noreferrer nofollow noopener"
            target="_blank"
            href={`https://youtu.be/${page.videoId}`}
          >
            Открыть на YouTube
          </Button>
        </div>
      </div>
    </div>;
  } else {
    return <div className={classes.videoPage}>
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${page.videoId}`}
        title="YouTube"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>;
  }
}
