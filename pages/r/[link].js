export const links = {
  "app_rules": {link: "/app/rules", args: false},
  "app_rules_moderator": {link: "/app/rules_moderator", args: false},
  "app_gallery": {link: "/app/gallery", args: false},
  "app_translates": {link: "/app/translates", args: false},
  "app_creators": {link: "/app/creators", args: false},
  "app_about": {link: "/fandom/10/wiki", args: false},
  "app_donate": {link: "/donates", args: false},
  "app_donateMake": {link: "/donates/create", args: false},
  "post": {link: "/post/", args: true},
  "chat": {link: "/chat/rf/", args: true},
  "conf": {link: "/chat/co/", args: true},
  "fandom": {link: "/fandom/", args: true},
  "profile_id": {link: "/account/", args: true},
  "profile": {link: "/account/", args: true},
  "moderation": {link: "/mod/", args: true},
  "sticker": {link: "/stickers/sticker/", args: true},
  "stickers": {link: "/stickers/", args: true},
  "event": {link: "/event/", args: true},
  "tag": {link: "/fandom/tag/", args: true},
  "wikifandom": {link: "/fandom/{id}/wiki/", args: true},
  "wikisection": {link: "/fandom/wiki/section/", args: true},
  "wikiarticle": {link: "/fandom/wiki/article/", args: true},
  "rubric": {link: "/rubric/", args: true},
  "fandomchat": {link: "/chat/fc/", args: true},
  "activity": {link: "/activity/", args: true},
};

export default function Redirect() {
  // unreachable
  return null;
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  };
}

export async function getStaticProps(ctx) {
  let handle = ctx.params.link, link;
  for (const linkType in links) {
    const linkSpec = links[linkType];
    if (!linkSpec.args && handle === linkType) {
      link = linkSpec.link;
      break;
    }
    if (linkSpec.args && handle.startsWith(linkType + "_") || handle.startsWith(linkType + "-")) {
      const id = handle.substring(linkType.length + 1).match(/^([^_-]+)([_-][^_-]+)*$/)[1];

      if (linkSpec.link.includes("{id}")) {
        link = linkSpec.link.replace("{id}", id);
      } else {
        link = linkSpec.link + id;
      }
      break;
    }
  }

  if (! link) {
    if (handle.toLowerCase().startsWith("user#")) {
      handle = handle.substring(5);
    }
    link = links.profile_id.link + encodeURIComponent(handle);
  }

  return {
    redirect: {
      destination: link,
    },
  };
}
