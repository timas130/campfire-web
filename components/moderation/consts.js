const modLevels = {
  // l - level, k - karma
  block: {l: 400, k: 300},
  toDrafts: {l: 410, k: 320},
  chats: {l: 415, k: 325},
  postTags: {l: 420, k: 330},
  fandomImage: {l: 435, k: 350},
  description: {l: 475, k: 400},
  names: {l: 490, k: 449},
  wikiEdit: {l: 500, k: 400},
  gallery: {l: 510, k: 450},
  links: {l: 520, k: 475},
  tags: {l: 530, k: 500},
  bgImage: {l: 540, k: 540},
  pin: {l: 560, k: 550},
  important: {l: 575, k: 560},
  closePost: {l: 600, k: 650},
  relayRace: {l: 620, k: 700},
  rubric: {l: 650, k: 800},

  adminMod: {l: 700, k: 700},
  ban: {l: 750, k: 1000},
};

export default modLevels;

export function adminCan(settings, action) {
  return settings.account.J_LVL > modLevels[action].l &&
    settings.account.karma30 > modLevels[action].k * 100;
}

export function isViceroy(settings, fandomId, languageId = 2) {
  return !!settings.viceroy.find(a => a.id === fandomId && a.l === languageId);
}

export function getKarmaCount(settings, fandomId, languageId = 2) {
  return settings.fandomsKarma.find(a => a.id === fandomId && a.l === languageId)?.k || 0;
}

export function modCan(settings, modAction, fandomId, languageId = 2) {
  if (settings.account.J_ID === 1) return true; // lol
  if (settings.account.accountEffects.find(a => a.effectIndex === 6)) return false; // "punished"
  if (adminCan(settings, "adminMod")) return true;
  if (isViceroy(settings, fandomId, languageId)) return true;

  const lvl = modLevels[modAction].l;
  const karma = modLevels[modAction].k;
  return settings.account.J_LVL >= lvl && getKarmaCount(settings, fandomId, languageId) >= karma * 100;
}
