import FandomHeader from "./FandomHeader";

export default function WikiListItem({fandomId, item}) {
  const link =
    item.itemType === 1 ? `/fandom/${fandomId}/wiki/${item.itemId}` :
    item.itemType === 2 ? `/fandom/wiki/${item.itemId}` :
    (() => {throw "bad itemType";})();
  return <FandomHeader
    imageId={item.imageId} name={getWikiName(item)}
    link={link} dense
  />;
}

export function getWikiName(item) {
  const translate = item.translates.find(v => v.languageCode === "ru");
  if (translate) return translate.name;
  else return item.name;
}
