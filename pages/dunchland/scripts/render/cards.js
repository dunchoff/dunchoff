"use strict";

/* ===== scripts/render/cards.js ===== */

function renderCards(ctx) {
  const { el, store } = ctx;
  const { state } = store;
  renderPlayerCards(ctx, "dunchoff", el.cardsList);
  renderPlayerCards(ctx, "chat", el.chatCardsList);
}

function renderPlayerCards(ctx, playerKey, node) {
  const { store } = ctx;
  const { state } = store;
  const cards = getCardsForPlayer(state, playerKey);
  if (!node) return;

  if (cards.length === 0) {
    node.innerHTML = '<div class="event-row">Карток поки немає.</div>';
    return;
  }

  node.innerHTML = cards.map((storedCard, index) => {
    const card = normalizeCard(storedCard);
    return `
    <div class="card-item">
      <img class="card-image" src="${card.image}" alt="${escapeHtml(card.title)}" onerror="this.src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='" />
      <div class="card-content">
        <strong>${escapeHtml(card.title)}</strong>
        <p>${escapeHtml(card.text)}</p>
        <button class="ghost-button" data-card-owner="${playerKey}" data-card-index="${index}" type="button">Використати</button>
      </div>
    </div>
  `;
  }).join("");

  node.querySelectorAll("[data-card-index]").forEach((btn) => {
    btn.disabled = !store.isAuthorized || store.isRolling;
    btn.hidden = !store.isAuthorized;
    btn.addEventListener("click", () => ctx.useCard(btn.dataset.cardOwner, Number(btn.dataset.cardIndex)));
  });
}
