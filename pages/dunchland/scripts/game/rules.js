"use strict";

/* ===== scripts/game/rules.js ===== */

function applySector({ state, playerKey, sector, passedStart, drawCard, moveToNextType }) {
  const player = state.players[playerKey];
  let points = Number(sector.points || 0);

  if (points < 0 && player.shield) {
    player.shield = false;
    points = 0;
    addLog(state, "shield", `${player.name} заблокував штраф.`);
  }

  player.score += points;
  if (passedStart) player.score += 20;
  if (sector.type === "bonus" && playerKey === "dunchoff") drawCard("з бонусного поля");
  if (sector.type === "railroad") moveToNextType(playerKey, "railroad");
  applySectorAction({ state, playerKey, sector, drawCard });
}

function applySectorAction({ state, playerKey, sector, drawCard }) {
  const player = state.players[playerKey];
  const action = sector.action || "";
  const value = Number(sector.actionValue || 0);
  if (!action) return;

  if (action === "skipTurn") {
    player.skipNextTurn = true;
    addLog(state, "sector", `${player.name} пропустить наступний хід.`);
  }
  if (action === "penalty") {
    const loss = Math.max(0, value || 10);
    if (player.shield) {
      player.shield = false;
      addLog(state, "shield", `${player.name} заблокував штраф поля.`);
    } else {
      player.score -= loss;
      addLog(state, "sector", `${player.name} втратив ${loss} очок.`);
    }
  }
  if (action === "bonus") {
    const bonus = Math.max(0, value || 10);
    player.score += bonus;
    addLog(state, "sector", `${player.name} отримав бонус ${bonus} очок.`);
  }
  if (action === "teleport") {
    const target = Math.min(state.sectors.length, Math.max(1, value || 1));
    player.sectorId = target;
    addLog(state, "sector", `${player.name} перемістився на поле #${target}.`);
  }
  if (action === "drawCard") {
    drawCard("з дії поля");
  }
  if (action === "shield") {
    player.shield = true;
    addLog(state, "sector", `${player.name} отримав щит.`);
  }
}
