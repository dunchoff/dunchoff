"use strict";

/* ===== scripts/render/saves.js ===== */

function renderSaveSlots(ctx) {
  const { el, store } = ctx;
  if (!el.saveSlots) return;

  if (store.saveSlots.length === 0) {
    el.saveSlots.innerHTML = '<div class="event-row">Слотів ще немає. Натисни "Зберегти слот".</div>';
    return;
  }

  el.saveSlots.innerHTML = store.saveSlots.map((slot) => `
    <div class="save-slot">
      <div>
        <strong>${escapeHtml(slot.name)}</strong>
        <span>${new Date(slot.createdAt).toLocaleString("uk-UA")} - хід ${slot.state.turnNumber}</span>
      </div>
      <div class="toolbar-actions">
        <button class="ghost-button" data-load-slot="${slot.id}" type="button">Завантажити</button>
        <button class="ghost-button" data-delete-slot="${slot.id}" type="button">Видалити</button>
      </div>
    </div>
  `).join("");

  el.saveSlots.querySelectorAll("[data-load-slot]").forEach((btn) => btn.addEventListener("click", () => ctx.loadSlot(btn.dataset.loadSlot)));
  el.saveSlots.querySelectorAll("[data-delete-slot]").forEach((btn) => btn.addEventListener("click", () => ctx.deleteSlot(btn.dataset.deleteSlot)));
  el.saveSlots.querySelectorAll("[data-load-slot], [data-delete-slot]").forEach((btn) => {
    btn.disabled = !store.isAuthorized;
    btn.hidden = !store.isAuthorized;
  });
}
