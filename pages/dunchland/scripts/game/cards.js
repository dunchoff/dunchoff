"use strict";

/* ===== scripts/game/cards.js ===== */

function getCardsForPlayer(state, playerKey) {
  if (Array.isArray(state.cards)) state.cards = { dunchoff: state.cards, chat: [] };
  if (!state.cards || typeof state.cards !== "object") state.cards = { dunchoff: [], chat: [] };
  if (!Array.isArray(state.cards[playerKey])) state.cards[playerKey] = [];
  return state.cards[playerKey];
}

function drawCard(ctx, source = "вручну", playerKey = "dunchoff") {
  const { state } = ctx.store;
  const cards = getCardsForPlayer(state, playerKey);
  if (cards.length >= MAX_CARDS) {
    addLog(state, "card", `${state.players[playerKey].name} вже має максимум ${MAX_CARDS} картки.`);
    return null;
  }
  const card = bonusCards[randomInt(0, bonusCards.length - 1)];
  cards.push({ ...card });
  addLog(state, "card", `${state.players[playerKey].name} отримав картку "${card.title}" (${source}).`);
  return card;
}
async function useCard(ctx, playerKey, index) {
  if (!requireAuth()) return;
  const { state } = ctx.store;
  const [card] = getCardsForPlayer(state, playerKey).splice(index, 1);
  if (!card) return;
  await applyCardEffect(ctx, card, playerKey);
  addLog(state, "card", `${state.players[playerKey].name} використав "${card.title}".`);
  ctx.render();
}

async function applyCardEffect(ctx, card, playerKey) {
  const { state } = ctx.store;
  const player = state.players[playerKey];
  const selected = getSelectedSector(state);

  if (card.effect === "score10") player.score += 10;
  if (card.effect === "score25") player.score += 25;
  if (card.effect === "scorePerCard") player.score += getCardsForPlayer(state, playerKey).length * 5;
  if (card.effect === "upgradeSector") selected.points += 10;
  if (card.effect === "reroll") await rollPlayer(ctx, playerKey);
  if (card.effect === "nearestBonus") moveToNextType(ctx, playerKey, "bonus");
  if (card.effect === "teleportStart") movePlayerToSector(ctx, playerKey, 1);
  if (card.effect === "swapPlaces") swapPlaces(state);
  if (card.effect === "shield") player.shield = true;
  if (card.effect === "giveEnemyCard") giveEnemyCard(state, playerKey);
  if (card.effect === "leaderPenalty") penalizeLeader(state, 15);
  if (card.effect === "move3") await rollPlayer(ctx, playerKey, 3);
  if (card.effect === "move4") await rollPlayer(ctx, playerKey, 4);
  if (card.effect === "underdogBonus") giveUnderdogBonus(state, playerKey);
  if (card.effect === "loseHalfTurnScore") loseHalfTurnScore(state, playerKey);
  if (card.effect === "allPlayersMinus10") allPlayersMinus10(state);
}

function movePlayerToSector(ctx, playerKey, sectorId) {
  const { state, landingPlayer } = ctx.store;
  const player = state.players[playerKey];
  player.sectorId = sectorId;
  ctx.store.landingPlayer = playerKey;
  renderBoard(ctx);
  setTimeout(() => {
    if (ctx.store.landingPlayer === playerKey) {
      ctx.store.landingPlayer = landingPlayer;
      renderBoard(ctx);
    }
  }, 420);
  addLog(state, "move", `${player.name} перемістився на поле #${sectorId}.`);
}

function giveUnderdogBonus(state, playerKey) {
  const player = state.players[playerKey];
  const enemyKey = playerKey === "dunchoff" ? "chat" : "dunchoff";
  if (player.score < state.players[enemyKey].score) {
    player.score += 30;
    addLog(state, "card", `${player.name} отримав +30 очок як не лідер.`);
  } else {
    addLog(state, "card", `${player.name} не отримав бонус IMDb 10/10, бо він не відстає.`);
  }
}

function loseHalfTurnScore(state, playerKey) {
  const player = state.players[playerKey];
  const sector = getPlayerSector(state, playerKey);
  const loss = Math.max(0, Math.floor(Math.abs(Number(sector.points || 0)) / 2));
  player.score -= loss;
  addLog(state, "card", `${player.name} втратив ${loss} очок за касовий провал.`);
}

function allPlayersMinus10(state) {
  Object.values(state.players).forEach((player) => {
    player.score -= 10;
  });
  addLog(state, "card", "Усі гравці втратили по 10 очок.");
}

function giveEnemyCard(state, playerKey) {
  const enemyKey = playerKey === "dunchoff" ? "chat" : "dunchoff";
  const enemyCards = getCardsForPlayer(state, enemyKey);
  if (enemyCards.length >= MAX_CARDS) {
    addLog(state, "card", `${state.players[enemyKey].name} вже має максимум ${MAX_CARDS} картки.`);
    return;
  }
  const card = bonusCards[randomInt(0, bonusCards.length - 1)];
  enemyCards.push({ ...card });
  addLog(state, "card", `${state.players[enemyKey].name} отримав картку від суперника: "${card.title}".`);
}

function swapPlaces(state) {
  const a = state.players.dunchoff.sectorId;
  state.players.dunchoff.sectorId = state.players.chat.sectorId;
  state.players.chat.sectorId = a;
}

function penalizeLeader(state, amount) {
  const leaderKey = state.players.dunchoff.score >= state.players.chat.score ? "dunchoff" : "chat";
  const leader = state.players[leaderKey];

  if (leader.shield) {
    leader.shield = false;
    addLog(state, "shield", `${leader.name} заблокував штраф лідеру.`);
    return;
  }

  leader.score -= amount;
}
