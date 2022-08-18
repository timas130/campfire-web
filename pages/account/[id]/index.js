import {fetchProfile} from "../../api/account/[id]";
import FeedLayout, {FeedLoader} from "../../../components/FeedLayout";
import ProfileCard from "../../../components/profile/ProfileCard";
import Head from "next/head";
import Post from "../../../components/publication/post/Post";
import {fetcher, useInfScroll, useUser} from "../../../lib/client-api";
import postClasses from "../../../styles/Post.module.css";
import FormattedText from "../../../components/FormattedText";
import MetaTags from "../../../components/MetaTags";
import {handleSSRError} from "../../../lib/api";
import useSWR from "swr";
import classNames from "classnames";
import Button from "../../../components/controls/Button";
import classes from "../../../styles/Profile.module.css";
import {ExternalLinkIcon, PencilAltIcon} from "@heroicons/react/solid";
import {useState} from "react";
import Input from "../../../components/controls/Input";
import {EditToolbar, ToolbarButton} from "../../../components/publication/post/pages/Page";
import {faCheck} from "@fortawesome/free-solid-svg-icons/faCheck";
import {faTimes} from "@fortawesome/free-solid-svg-icons/faTimes";
import Publication from "../../../components/publication/Publication";
import PostFilters, {defaultProfilePostFilters} from "../../../components/publication/post/PostFilters";
import cardClasses from "../../../styles/Card.module.css";

export function ProfileBioEditor({type = "description", initialValue = "", onFinish = () => {}, accountId = 0}) {
  const {mutate} = useSWR(`/api/account/${accountId}`);
  const [value, setValue] = useState(initialValue);

  const submit = ev => {
    ev.preventDefault();
    mutate(async account => {
      await fetcher("/api/user/edit", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({prop: type, value: value}),
      });
      return {
        ...account,
        profile: {
          ...account.profile,
          [type]: value,
        },
      };
    }).then(onFinish);
  };

  return <form onSubmit={submit} className={classes.bioEditForm}>
    <Input
      el={type === "status" ? "input" : "textarea"}
      className={type === "status" ? classes.centered : classes.bioEditInput}
      value={value} onChange={ev => setValue(ev.target.value)}
      autoFocus
    />
    <EditToolbar>
      <ToolbarButton left icon={faCheck} onClick={submit} />
      <ToolbarButton icon={faTimes} onClick={onFinish} />
    </EditToolbar>
  </form>;
}

export default function Profile({account: initialAccount, profile: initialProfile}) {
  const {data: {account, profile}} = useSWR(
    `/api/account/${initialAccount.J_ID}`,
    {
      fallbackData: {account: initialAccount, profile: initialProfile},
      revalidateOnFocus: false,
    },
  );
  const [postFilters, setPostFilters] = useState(defaultProfilePostFilters);
  const {data: pubPages, ref, showLoader} = useInfScroll(
    `/api/account/${account.J_ID}/publications?types=${postFilters.unitTypes.join(",")}`
  );

  const user = useUser();
  const isCurrentUser = user?.J_ID === account.J_ID;

  const [editing, setEditing] = useState({status: false, description: false});

  const title = `Профиль ${account.J_NAME} в Campfire`;
  return <>
    <Head>
      <title>{title}</title>
      <MetaTags
        title={title} description={profile.description}
        url={`https://campfire.moe/account/${encodeURIComponent(account.J_NAME)}`}
        image={`https://campfire.moe/api/image/${account.J_IMAGE_ID}`}
      />
    </Head>
    <FeedLayout
      list={<>
        <ProfileCard account={account} profile={profile} />
        <div className={classNames(postClasses.post, postClasses.mb05)}>
          {isCurrentUser && !editing.status && <div className={classes.bioEditRow}>
            <Button className={classes.bioEditButton} onClick={() => setEditing(a => ({...a, status: true}))}>
              <PencilAltIcon />
              Редактировать статус
            </Button>
          </div>}
          <div className={postClasses.profileStatus}>
            {!editing.status ?
              <FormattedText text={profile.status.trim() || "{_cweb_secondary Статус не задан}"} /> :
              <ProfileBioEditor
                type="status" initialValue={profile.status} accountId={initialAccount.J_ID}
                onFinish={() => setEditing(a => ({...a, status: false}))}
              />}
          </div>
        </div>
        <div className={postClasses.post}>
          {isCurrentUser && !editing.description && <div className={classes.bioEditRow}>
            <Button className={classes.bioEditButton} onClick={() => setEditing(a => ({...a, description: true}))}>
              <PencilAltIcon />
              Редактировать описание
            </Button>
          </div>}
          <div className={postClasses.header}>
            {!editing.description ?
              <FormattedText text={profile.description.trim() || "{_cweb_secondary Нет описания}"} /> :
              <ProfileBioEditor
                type="description" initialValue={profile.description} accountId={initialAccount.J_ID}
                onFinish={() => setEditing(a => ({...a, description: false}))}
              />}
          </div>
        </div>
        {profile.links?.links[0]?.url && <div className={classNames(postClasses.post, cardClasses.fandomProfileLinks)}>
          {profile.links.links.map((link, idx) => link.url && <a
            href={link.url} target="_blank"
            rel="noreferrer noopener" key={idx}
            className={classNames(cardClasses.fandomLink, cardClasses.fandomProfileLink)}
          >
            <div className={cardClasses.fandomLinkTitle}>{link.title}</div>
            <div className={cardClasses.fandomLinkUrl}>
              <ExternalLinkIcon />
              {link.url}
            </div>
          </a>)}
        </div>}

        <PostFilters options={postFilters} setOptions={setPostFilters} />
        {
          postFilters.unitTypes.includes(9) &&
          profile.pinnedPost &&
          <Post post={profile.pinnedPost} pinned showBestComment />
        }
        {pubPages && pubPages.map(page => page.map(pub => (
          <Publication pub={pub} key={pub.id} full showBestComment />
        )))}
        {showLoader && <FeedLoader ref={ref} />}
      </>}
    />
  </>;
}

export async function getServerSideProps(ctx) {
  try {
    return {
      props: await fetchProfile(ctx.req, ctx.res, ctx.query.id),
    };
  } catch (e) {
    return handleSSRError(e, ctx.res);
  }
}
