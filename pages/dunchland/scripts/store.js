"use strict";

/* ===== scripts/store.js ===== */

const store = {
  state: null,
  saveSlots: [],
  wheelAngles: { card: 0, custom: 0 },
  isAuthorized: sessionStorage.getItem("dunchland-auth") === "true",
  landingPlayer: null,
  isRolling: false,
};

const AUTH_LOGIN = "dunchoff";
const AUTH_PASSWORD = "dunchland123";
const MAX_CARDS = 3;

const sectorActions = [
  { value: "", label: "Без дії", hint: "Поле дає тільки базові очки." },
  { value: "skipTurn", label: "Пропуск ходу", hint: "Гравець пропускає свій наступний кидок." },
  { value: "penalty", label: "Штраф", hint: "Віднімає значення дії від рахунку." },
  { value: "bonus", label: "Бонус", hint: "Додає значення дії до рахунку." },
  { value: "teleport", label: "Телепорт", hint: "Переміщує на поле з номером у значенні дії." },
  { value: "drawCard", label: "Картка", hint: "Видає випадкову картку гравцю." },
  { value: "shield", label: "Щит", hint: "Блокує наступний штраф." },
];
const actionLabels = Object.fromEntries(sectorActions.map((action) => [action.value, action.label]));
sectorActions.splice(0, sectorActions.length,
  { value: "", label: "Без дії", hint: "Поле дає тільки базові очки." },
  { value: "skipTurn", label: "Пропуск ходу", hint: "Гравець пропускає свій наступний кидок." },
  { value: "penalty", label: "Штраф", hint: "Віднімає значення дії від рахунку." },
  { value: "bonus", label: "Бонус", hint: "Додає значення дії до рахунку." },
  { value: "teleport", label: "Телепорт", hint: "Переміщує на поле з номером у значенні дії." },
  { value: "drawCard", label: "Картка", hint: "Видає випадкову картку гравцю." },
  { value: "shield", label: "Щит", hint: "Блокує наступний штраф." },
);
Object.keys(actionLabels).forEach((key) => delete actionLabels[key]);
sectorActions.forEach((action) => {
  actionLabels[action.value] = action.label;
});
sectorActions.splice(0, sectorActions.length,
  { value: "", label: "Без дії", hint: "Поле дає тільки базові очки.", icon: "-" },
  { value: "penalty", label: "Штраф", hint: "Віднімає значення дії від рахунку.", icon: "−" },
  { value: "bonus", label: "Бонус", hint: "Додає значення дії до рахунку.", icon: "+" },
  { value: "teleport", label: "Телепорт", hint: "Переміщує на поле з номером у значенні дії.", icon: "↗" },
  { value: "drawCard", label: "Картка", hint: "Видає випадкову картку гравцю.", icon: "□" },
);
Object.keys(actionLabels).forEach((key) => delete actionLabels[key]);
sectorActions.forEach((action) => {
  actionLabels[action.value] = action.label;
});
const actionIcons = Object.fromEntries(sectorActions.map((action) => [action.value, action.icon]));
