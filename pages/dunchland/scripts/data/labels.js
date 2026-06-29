"use strict";

/* ===== scripts/data/labels.js ===== */

const sectorTypes = [
  { value: "start", label: "Старт", icon: "S" },
  { value: "game", label: "Ігри", icon: "G" },
  { value: "movie", label: "Фільми", icon: "F" },
  { value: "series", label: "Серіали", icon: "T" },
  { value: "youtube", label: "Подивляшки", icon: "P" },
  { value: "vip", label: "VIP", icon: "V" },
  { value: "bonus", label: "Картка", icon: "+" },
  { value: "railroad", label: "Перехід", icon: "R" },
  { value: "prison", label: "Пауза", icon: "!" },
  { value: "parking", label: "Відпочинок", icon: "P" },
];
const typeLabels = Object.fromEntries(sectorTypes.map((type) => [type.value, type.label]));
const typeIcons = Object.fromEntries(sectorTypes.map((type) => [type.value, type.icon]));
sectorTypes.splice(0, sectorTypes.length,
  { value: "movie", label: "Фільми", icon: "F" },
  { value: "series", label: "Серіали", icon: "S" },
  { value: "youtube", label: "YouTube", icon: "Y" },
  { value: "tiktok", label: "TikTok", icon: "T" },
  { value: "vip", label: "VIP", icon: "V" },
);
Object.keys(typeLabels).forEach((key) => delete typeLabels[key]);
Object.keys(typeIcons).forEach((key) => delete typeIcons[key]);
sectorTypes.forEach((type) => {
  typeLabels[type.value] = type.label;
  typeIcons[type.value] = type.icon;
});
const boardPath = [
  [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1], [10, 1],
  [11, 1], [11, 2], [11, 3], [11, 4], [11, 5], [11, 6], [11, 7], [11, 8], [11, 9], [11, 10],
  [11, 11], [10, 11], [9, 11], [8, 11], [7, 11], [6, 11], [5, 11], [4, 11], [3, 11], [2, 11],
  [1, 11], [1, 10], [1, 9], [1, 8], [1, 7], [1, 6], [1, 5], [1, 4], [1, 3], [1, 2],
];
