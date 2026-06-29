"use strict";

/* ===== scripts/game/wheel.js ===== */

function paintWheel(node, values) {
  if (!node) return;
  const colors = ["#4dc06a", "#d9b53f", "#d64f84", "#42a5d9", "#8f6dd8", "#d8703f"];
  const segments = Math.max(values.length, 1);
  const step = 360 / segments;
  node.style.background = `conic-gradient(${values.map((_, index) => `${colors[index % colors.length]} ${index * step}deg ${(index + 1) * step}deg`).join(", ")})`;
  node.innerHTML = "";
}
function spinCardWheel(ctx) {
  const { el, store } = ctx;
  const duration = getDuration(el.cardWheelDurationInput);
  const index = randomInt(0, bonusCards.length - 1);
  const card = bonusCards[index];

  startSpin(ctx, "card", el.cardWheelDisk, index, bonusCards.length, duration, () => {
    const cards = getCardsForPlayer(store.state, "dunchoff");
    const received = cards.length < MAX_CARDS ? card : null;
    if (received) {
      cards.push({ ...received });
      addLog(store.state, "card", `${store.state.players.dunchoff.name} отримав картку "${received.title}" (з колеса карток).`);
    } else {
      addLog(store.state, "card", `${store.state.players.dunchoff.name} вже має максимум ${MAX_CARDS} картки.`);
    }
    if (el.cardWheelResult) {
      el.cardWheelResult.textContent = received
        ? `Випала картка: ${received.title}.`
        : `У dunchoff уже максимум ${MAX_CARDS} картки.`;
    }
    if (received) addLog(store.state, "wheel", `Колесо карток: ${received.title}.`);
    ctx.render();
  }, el.cardWheelResult);
}
function spinCustomWheel(ctx) {
  const { el, store } = ctx;
  const values = parseCustomValues(el.customWheelInput);
  store.state.customWheelValues = values;

  if (values.length === 0) {
    if (el.customWheelResult) el.customWheelResult.textContent = "Додай хоча б одне значення.";
    ctx.render();
    return;
  }

  const duration = getDuration(el.customWheelDurationInput);
  const index = randomInt(0, values.length - 1);
  startSpin(ctx, "custom", el.customWheelDisk, index, values.length, duration, () => {
    if (el.customWheelResult) el.customWheelResult.textContent = `Випало: ${values[index]}`;
    addLog(store.state, "wheel", `Своє колесо: ${values[index]}.`);
    ctx.render();
  }, el.customWheelResult);
}
function parseCustomValues(input) {
  if (!input) return [];
  return input.value.split(/[\n,;]/).map((value) => value.trim()).filter(Boolean).slice(0, 18);
}

function startSpin(ctx, key, node, index, length, duration, done, resultNode) {
  if (!node) return;
  const segment = 360 / Math.max(length, 1);
  ctx.store.wheelAngles[key] += duration * 360 + (360 - index * segment) - segment / 2;
  node.style.transitionDuration = `${duration}s`;
  node.style.transform = `rotate(${ctx.store.wheelAngles[key]}deg)`;
  if (resultNode) resultNode.textContent = `Крутиться ${duration} с...`;
  setTimeout(done, duration * 1000);
}

function getDuration(input) {
  if (!input) return 4;
  return Math.min(12, Math.max(1, Number(input.value || 4)));
}
