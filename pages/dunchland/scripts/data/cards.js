"use strict";

/* ===== scripts/data/cards.js ===== */

const bonusCards = [
  { title: "Підкрутка", image: "./assets/cards/chalk-boost.png", text: "Отримай +10 очок.", effect: "score10" },
  { title: "Рерол", image: "./assets/cards/chalk-reroll.png", text: "Перекинь кубики ще раз.", effect: "reroll" },
  { title: "Бонус забудови", image: "./assets/cards/chalk-building-bonus.png", text: "Отримай +25 очок.", effect: "score25" },
  { title: "Колекціонер", image: "./assets/cards/chalk-collector.png", text: "Отримай +5 за кожну картку.", effect: "scorePerCard" },
  { title: "Прокачка поля", image: "./assets/cards/chalk-upgrade-sector.png", text: "Додай +10 до обраного поля.", effect: "upgradeSector" },
  { title: "Телепорт", image: "./assets/cards/chalk-teleport.png", text: "Повернись на самий початок.", effect: "teleportStart" },
  { title: "Обмін місцями", image: "./assets/cards/chalk-swap-places.png", text: "Поміняйся позиціями з чатом.", effect: "swapPlaces" },
  { title: "Подарунок супернику", image: "./assets/cards/chalk-gift-enemy.png", text: "Суперник отримує випадкову картку.", effect: "giveEnemyCard" },
  { title: "Штраф лідеру", image: "./assets/cards/chalk-leader-penalty.png", text: "Лідер втрачає 15 очок.", effect: "leaderPenalty" },
  { title: "Стрибок сюжету", image: "./assets/cards/chalk-move-four.png", text: "Зроби 4 кроки вперед.", effect: "move4" },
  { title: "Монтаж", image: "./assets/cards/chalk-move-three.png", text: "Миттєво перемістися на 3 поля вперед.", effect: "move3" },
  { title: "IMDb 10/10", image: "./assets/cards/chalk-rating-star.png", text: "Отримай +30 очок, якщо ти не лідер.", effect: "underdogBonus" },
  { title: "Касовий провал", image: "./assets/cards/chalk-box-office-fail.png", text: "Втрать половину очок цього ходу.", effect: "loseHalfTurnScore" },
  { title: "Рейтинг 18+", image: "./assets/cards/chalk-rating-18.png", text: "Усі гравці втрачають по 10 очок.", effect: "allPlayersMinus10" },
];

const cardEffectLabels = {
  score10: "+10 очок",
  reroll: "перекид кубиків",
  score25: "+25 очок",
  scorePerCard: "бонус за картки",
  upgradeSector: "підсилення поля",
  teleportStart: "телепорт на старт",
  swapPlaces: "обмін позиціями",
  giveEnemyCard: "картка супернику",
  leaderPenalty: "штраф лідеру",
  move4: "рух на 4 поля",
  move3: "рух на 3 поля",
  underdogBonus: "бонус тому, хто позаду",
  loseHalfTurnScore: "втрата частини очок",
  allPlayersMinus10: "-10 усім",
};
