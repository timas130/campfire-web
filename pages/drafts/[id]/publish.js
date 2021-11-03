import {useRouter} from "next/router";
import {fetcher} from "../../../lib/client-api";
import FeedLayout, {FeedLoader} from "../../../components/FeedLayout";
import FandomCard from "../../../components/cards/FandomCard";
import useSWRImmutable from "swr/immutable";
import Link from "next/link";
import cardClasses from "../../../styles/Card.module.css";
import {ArrowLeftIcon} from "@heroicons/react/solid";
import {useState} from "react";
import {Tag} from "../../../components/publication/post/Tags";
import classes from "../../../styles/Draft.module.css";

export default function PublishDraft() {
  const draftId = useRouter().query.id;
  const {data: draft} = useSWRImmutable(draftId && `/api/drafts/${draftId}`, fetcher);
  const {data: tags} = useSWRImmutable(draft && `/api/fandom/${draft.fandom.id}/tags`, fetcher);

  const [selectedTags, setSelectedTags] = useState([]);

  return <FeedLayout
    list={<>
      <Link href={`/drafts/${draftId}`}><a className={cardClasses.moreFandoms}>
        <ArrowLeftIcon />
        Назад к редактированию
      </a></Link>
      {(draft && tags) ? <>
        {tags
          .filter(tag => !tag.parentUnitId)
          .map(parentTag => <div key={parentTag.id}>
            <h3 className={classes.tagHeader}>{parentTag.jsonDB.J_NAME}</h3>
            {tags
              .filter(tag => tag.parentUnitId === parentTag.id)
              .map(tag => <Tag
                key={tag.id} tag={tag}
                selectable selected={selectedTags.includes(tag.id)}
                select={() => setSelectedTags(tags => {
                  if (tags.includes(tag.id)) return tags.filter(id => id !== tag.id);
                  else return [...tags, tag.id];
                })}
              />)}
          </div>)}
      </> : <FeedLoader />}
    </>}
    sidebar={draft && <FandomCard fetchId={draft.fandom.id} />}
  />;
}
