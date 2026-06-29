"use strict";

/* ===== scripts/state.js ===== */

const fallbackSectors = [
  "Старт", "Ігри 90-х", "Фільми 90-х", "Серіали 90-х",
  "Фільми 2000-х", "Вокзал 6", "Ігри 2000-х", "Серіали 2000-х",
  "Бонус 9", "Парковка 10", "Ігри 2010-х", "Фільми 2010-х",
  "Серіали 2010-х", "Аніме 2000-х", "Кіновсесвіти", "Бонус 16",
  "Мультфільми 2000-х", "Інді-ігри", "Вокзал 20", "Ігри 2020-х",
  "Фільми 2020-х", "Серіали 2020-х", "Аніме 2010-х", "Мемні фільми",
  "Кіберпанк", "В'язниця 26", "Супергерої", "Хоррор",
  "Парковка 29", "Кооп-ігри", "Фентезі", "Сай-фай",
  "Анімація 2020-х", "Настільні адаптації", "Вокзал 36", "Ретро-кіно",
  "Ретро-ігри", "Серіальні фінали", "Кіносаундтреки", "Культові цитати",
];
function buildDefaultSectors() {
  const merged = Array.from({ length: 40 }, (_, index) => {
    const item = contentSectors[index] || sectors[index] || {};
    const action = getDefaultSectorAction(index, item.type || "movie");
    return {
      id: index + 1,
      name: item.name || fallbackSectors[index] || `Сектор ${index + 1}`,
      type: item.type || "game",
      color: item.color || "#4dc06a",
      points: Number(item.points ?? 12),
      tagline: item.tagline || "Тематична категорія",
      description: item.description || "Опис можна змінити у scripts/data/sectors.js.",
      action: item.action || action.action,
      actionValue: Number(item.actionValue ?? action.actionValue),
      examples: Array.isArray(item.examples) ? item.examples : [],
    };
  });
  return merged;
}
function getDefaultSectorAction(index, type) {
  const id = index + 1;
  if (type === "vip") return { action: "bonus", actionValue: 8 };
  if (id % 13 === 0) return { action: "teleport", actionValue: Math.max(1, id - 6) };
  if (id % 11 === 0) return { action: "drawCard", actionValue: 0 };
  if (id % 7 === 0) return { action: "drawCard", actionValue: 0 };
  if (id % 5 === 0) return { action: "bonus", actionValue: type === "youtube" || type === "tiktok" ? 5 : 7 };
  if (id % 4 === 0) return { action: "penalty", actionValue: 4 };
  if (id % 9 === 0) return { action: "teleport", actionValue: Math.min(40, id + 3) };
  return { action: "bonus", actionValue: type === "series" ? 4 : 3 };
}
const defaultSectors = buildDefaultSectors();
defaultSectors.forEach((sector, index) => {
  if (contentSectors[index] && !contentSectors[index].tagline) {
    sector.tagline = getSectorCategoryLabel(contentSectors[index]);
  }
});
function getSectorCategoryLabel(item) {
  const labels = { movie: "Фільми", series: "Серіали", youtube: "YouTube", tiktok: "TikTok", vip: "VIP" };
  const label = labels[item.type] || item.type || "Категорія";
  if (item.type === "vip") return "Персональне VIP-поле";
  return `${label}: ${item.description.split(".")[0]}.`;
}
function createLog(type, message) {
  return { type, message, time: new Date().toISOString() };
}
function createDefaultState() {
  return {
    players: {
      dunchoff: { name: "dunchoff", score: 0, color: "#e8142c", sectorId: 1, lastRoll: null, shield: false, skipNextTurn: false },
      chat: { name: "чат", score: 0, color: "#32ade6", sectorId: 1, lastRoll: null, shield: false, skipNextTurn: false },
    },
    currentTurn: "dunchoff",
    turnNumber: 1,
    selectedSectorId: 1,
    sectors: clone(defaultSectors),
    cards: {
      dunchoff: [],
      chat: [],
    },
    reviews: [],
    customWheelValues: [],
    logs: [createLog("system", "ДанчЛенд запущено.")],
  };
}
function normalizeState(parsed) {
  const base = createDefaultState();
  if (!parsed || typeof parsed !== "object") return base;

  const sectors = Array.isArray(parsed.sectors) && parsed.sectors.length === 40
    ? parsed.sectors.map((sector, index) => ({ ...base.sectors[index], ...sector, id: index + 1 }))
    : base.sectors;
  syncSpecialSectorText(sectors, base.sectors);

  return {
    ...base,
    ...parsed,
    players: {
      dunchoff: { ...base.players.dunchoff, ...(parsed.players?.dunchoff || {}), name: "dunchoff" },
      chat: { ...base.players.chat, ...(parsed.players?.chat || {}) },
    },
    sectors,
    cards: normalizeCards(parsed.cards, base.cards),
    reviews: Array.isArray(parsed.reviews) ? parsed.reviews : base.reviews,
    logs: Array.isArray(parsed.logs) ? parsed.logs : base.logs,
    customWheelValues: Array.isArray(parsed.customWheelValues) ? parsed.customWheelValues : base.customWheelValues,
  };
}
function syncSpecialSectorText(sectors, sourceSectors) {
  sourceSectors.forEach((source, index) => {
    const sector = sectors[index];
    if (!source || !sector) return;
    sector.name = source.name;
    sector.type = source.type;
    sector.color = source.color;
    sector.tagline = source.tagline;
    sector.description = source.description;
    sector.action = source.action || "";
    sector.actionValue = Number(source.actionValue || 0);
    sector.examples = Array.isArray(source.examples) ? source.examples : [];
  });
}
function normalizeCards(cards, fallback) {
  if (Array.isArray(cards)) return { ...fallback, dunchoff: cards.map(normalizeCard) };
  if (cards && typeof cards === "object") {
    return {
      dunchoff: Array.isArray(cards.dunchoff) ? cards.dunchoff.map(normalizeCard) : fallback.dunchoff,
      chat: Array.isArray(cards.chat) ? cards.chat.map(normalizeCard) : fallback.chat,
    };
  }
  return fallback;
}
function normalizeCard(card) {
  if (!card || typeof card !== "object") return card;
  const fresh = bonusCards.find((item) => item.effect === card.effect)
    || bonusCards.find((item) => item.title === card.title);
  return fresh ? { ...card, title: fresh.title, text: fresh.text, image: fresh.image, effect: fresh.effect } : card;
}
function addLog(state, type, message) {
  state.logs.push(createLog(type, message));
  state.logs = state.logs.slice(-220);
}
function getSelectedSector(state) {
  return state.sectors.find((sector) => sector.id === state.selectedSectorId) || state.sectors[0];
}
function getPlayerSector(state, playerKey) {
  return state.sectors.find((sector) => sector.id === state.players[playerKey].sectorId) || state.sectors[0];
}
