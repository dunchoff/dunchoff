"use strict";

/* ===== scripts/game/movement.js ===== */

async function rollPlayer(ctx, playerKey, forcedStep = null) {
  const { state } = ctx.store;
  const player = state.players[playerKey];
  const d1 = forcedStep || randomInt(1, 6);
  const d2 = forcedStep ? 0 : randomInt(1, 6);
  const step = forcedStep || d1 + d2;
  const current = player.sectorId - 1;
  const next = (current + step) % state.sectors.length;
  const passedStart = current + step >= state.sectors.length;
  const sector = state.sectors[next];

  if (!forcedStep) await showDiceRoll(ctx, player.name, d1, d2);
  await animatePlayerRoute(ctx, playerKey, step);
  player.lastRoll = forcedStep ? [step] : [d1, d2];
  player.sectorId = sector.id;
  applySector({
    state,
    playerKey,
    sector,
    passedStart,
    drawCard: (source) => ctx.drawCard(source, playerKey),
    moveToNextType: (key, type) => moveToNextType(ctx, key, type),
  });

  addLog(state, "roll", `${player.name}: ${forcedStep ? step : `${d1}+${d2}`}, поле #${sector.id} ${sector.name}.`);
  if (playerKey === "dunchoff" && Math.random() < CARD_CHANCE) ctx.drawCard("авто");
}
async function animatePlayerRoute(ctx, playerKey, step) {
  const { state } = ctx.store;
  const player = state.players[playerKey];

  for (let i = 1; i <= step; i += 1) {
    player.sectorId = ((player.sectorId - 1 + 1) % state.sectors.length) + 1;
    renderBoard(ctx);
    await wait(135);
  }

  ctx.store.landingPlayer = playerKey;
  renderBoard(ctx);
  await wait(420);
  ctx.store.landingPlayer = null;
}
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
async function showDiceRoll(ctx, playerName, d1, d2) {
  const { el } = ctx;
  if (!el.diceDialog || !el.diceOne || !el.diceTwo) return;
  if (el.diceDialogTitle) el.diceDialogTitle.textContent = `Кидає ${playerName}`;
  openDialog(el.diceDialog);

  const startedAt = Date.now();
  await new Promise((resolve) => {
    const timer = setInterval(() => {
      setDiceFace(el.diceOne, randomInt(1, 6));
      setDiceFace(el.diceTwo, randomInt(1, 6));
      if (Date.now() - startedAt > 900) {
        clearInterval(timer);
        setDiceFace(el.diceOne, d1);
        setDiceFace(el.diceTwo, d2);
        setTimeout(resolve, 520);
      }
    }, 80);
  });

  closeDialog(el.diceDialog);
}
function setDiceFace(node, value) {
  if (!node) return;
  node.dataset.face = String(value);
  node.textContent = String(value);
}
function moveToNextType(ctx, playerKey, type) {
  const { state } = ctx.store;
  const player = state.players[playerKey];
  const currentIndex = player.sectorId - 1;
  const found = state.sectors.find((sector, index) => index > currentIndex && sector.type === type)
    || state.sectors.find((sector) => sector.type === type);

  if (!found || found.id === player.sectorId) return;
  player.sectorId = found.id;
  player.score += Math.max(0, Number(found.points || 0));
  addLog(state, "move", `${player.name} перейшов на #${found.id}.`);
}
