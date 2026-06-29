"use strict";

/* ===== scripts/render/wheels.js ===== */

function renderWheels(ctx) {
  const { el, store } = ctx;
  if (el.cardWheelDisk) paintWheel(el.cardWheelDisk, bonusCards.map((card) => card.title));
  if (el.customWheelDisk) paintWheel(el.customWheelDisk, store.state.customWheelValues);
}
