import {useRouter} from "next/router";
import {fetcher, useInfScroll, useUser} from "../../../lib/client-api";
import FeedLayout, {FeedLoader} from "../../../components/FeedLayout";
import FandomCard from "../../../components/cards/FandomCard";
import useSWRImmutable from "swr/immutable";
import {ArrowLeftIcon} from "@heroicons/react/solid";
import {useState} from "react";
import {Tag} from "../../../components/publication/post/Tags";
import classes from "../../../styles/Draft.module.css";
import InputLabel from "../../../components/controls/InputLabel";
import Input from "../../../components/controls/Input";
import SpoilerPage from "../../../components/publication/post/pages/SpoilerPage";
import FandomHeader from "../../../components/FandomHeader";
import {KarmaCounter} from "../../../components/Karma";
import {Countdown} from "../../../components/publication/post/pages/UserActivityPage";
import Button from "../../../components/controls/Button";
import IconLink from "../../../components/IconLink";

function RubricList({onSelect = (_id => {}), selectedId = 0, fandomId = 0, showEmpty = false}) {
  const user = useUser();
  const {data: rubricPages, ref, showLoader} = useInfScroll(
    user && `/api/fandom/${fandomId}/rubrics?owner=${user.J_ID}`,
  );

  return <div>
    {showEmpty && <FandomHeader
      name="Без рубрики" link="#"
      onClick={() => onSelect(0)}
      pinned={selectedId === 0} dense
    />}
    {rubricPages.map(page => page.map(rubric => (
      <FandomHeader
        link={`/rubric/${rubric.id}`}
        key={rubric.id} fandom={rubric.fandom} name={rubric.name}
        onClick={() => onSelect(rubric.id)}
        addRight={<KarmaCounter value={rubric.karmaCof} isCof />}
        pinned={selectedId === rubric.id} dense
      />
    )))}
    {showLoader && <FeedLoader ref={ref} />}
  </div>;
}
function ActivityList({onSelect = (_id => {}), selectedId = 0, fandomId = 0, showEmpty = false}) {
  const user = useUser();
  const {data: activityPages, ref, showLoader} = useInfScroll(
    user && `/api/activity/account/${user.J_ID}?fandom=${fandomId}`,
  );

  return <div>
    {showEmpty && <FandomHeader
      name="Без эстафеты" link="#"
      onClick={() => onSelect(0)}
      pinned={selectedId === 0} dense
    />}
    {activityPages.map(page => page.map(activity => (
      <FandomHeader
        link={`/activity/${activity.id}`}
        key={activity.id} fandom={activity.fandom}
        name={activity.name} author={<>
          Срок: <span className={classes.activityDue}>
            <Countdown timestamp={activity.tag_2 + 3600000 * 24} />
          </span>
        </>}
        onClick={() => onSelect(activity.id)}
        pinned={selectedId === activity.id} dense
      />
    )))}
    {showLoader && <FeedLoader ref={ref}/>}
  </div>;
}

export default function PublishDraft() {
  const draftId = useRouter().query.id;
  const {data: draft} = useSWRImmutable(draftId && `/api/drafts/${draftId}`, fetcher);
  const {data: tags} = useSWRImmutable(draft && `/api/fandom/${draft.fandom.id}/tags`, fetcher);

  const [selectedTags, setSelectedTags] = useState([]);
  const [selectedRubric, setSelectedRubric] = useState(0);
  const [selectedActivity, setSelectedActivity] = useState(0);
  const router = useRouter();

  const publish = ev => {
    ev.preventDefault();
    const data = new FormData(ev.target); // there is definitely a better way
    fetcher(`/api/drafts/${draft.id}/publish`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tags: selectedTags,
        notify: Boolean(data.get("notify")),
        pendingTime: 0,
        closed: Boolean(data.get("closed")),
        multilingual: Boolean(data.get("multilingual")),
        rubricId: selectedRubric,
        userActivityId: selectedActivity,
        userActivityNextId: 0,
      }),
    })
      .then(() => router.push(`/post/${draft.id}`))
      .catch(e => {
        console.error(e);
        alert("ушиб очка: " + JSON.stringify(e));
      });
  };

  return <FeedLayout
    list={<form className={classes.publish} onSubmit={publish}>
      <IconLink href={`/drafts/${draftId}`} right>
        <ArrowLeftIcon />Назад к редактированию
      </IconLink>
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
        <div className={classes.tagHeader}>
          <InputLabel block>
            <Input type="checkbox" name="notify" />
            Уведомить моих подписчиков
          </InputLabel>
          <InputLabel block>
            <Input type="checkbox" name="closed" />
            Закрытая публикация
          </InputLabel>
          <InputLabel block>
            <Input type="checkbox" name="multilingual" />
            Мультиязычная
          </InputLabel>
          <SpoilerPage page={{__internal: true, name: "Рубрика"}}>
            <RubricList
              fandomId={draft.fandom.id}
              selectedId={selectedRubric}
              onSelect={setSelectedRubric}
              showEmpty
            />
          </SpoilerPage>
          <SpoilerPage page={{__internal: true, name: "Эстафета"}}>
            <ActivityList
              fandomId={draft.fandom.id}
              selectedId={selectedActivity}
              onSelect={setSelectedActivity}
              showEmpty
            />
          </SpoilerPage>
        </div>
        <Button type="submit">
          Опубликовать
        </Button>
      </> : <FeedLoader />}
    </form>}
    sidebar={draft && <FandomCard fetchId={draft.fandom.id} />}
  />;
}
