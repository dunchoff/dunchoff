"use strict";

/* ===== scripts/render/players.js ===== */

function renderPlayers(ctx) {
  const { el, store } = ctx;
  const { state } = store;
  const p1 = state.players.dunchoff;
  const p2 = state.players.chat;

  if (el.turnBadge) el.turnBadge.textContent = `Хід ${state.turnNumber}`;
  if (el.diceResult) el.diceResult.textContent = p1.lastRoll ? p1.lastRoll.join(" + ") : "-";
  if (el.chatDiceResult) el.chatDiceResult.textContent = p2.lastRoll ? p2.lastRoll.join(" + ") : "-";
  if (el.playersList) el.playersList.innerHTML = `${renderPlayerChip(state, "dunchoff", p1)}${renderPlayerChip(state, "chat", p2)}`;
}

function renderPlayerChip(state, key, player) {
  const sector = getPlayerSector(state, key);
  const status = player.shield ? "Щит активний" : `Поле #${sector.id}`;
  return `
    <div class="player-chip ${state.currentTurn === key ? "active" : ""}">
      <span class="dot" style="background:${player.color}"></span>
      <strong>${escapeHtml(player.name)}</strong>
      <span>${player.score} очок</span>
      <small>${escapeHtml(status)}</small>
    </div>
  `;
}
