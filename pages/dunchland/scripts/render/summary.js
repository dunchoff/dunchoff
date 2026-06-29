"use strict";

/* ===== scripts/render/summary.js ===== */

function renderSummary(ctx) {
  const { el, store } = ctx;
  const { state } = store;
  const selected = getSelectedSector(state);
  const s1 = getPlayerSector(state, "dunchoff");
  const s2 = getPlayerSector(state, "chat");

  if (el.selectedHint) el.selectedHint.textContent = `Обрано: ${selected.name} #${selected.id} - ${typeLabels[selected.type] || selected.type}`;
  if (el.playerSummary) {
    el.playerSummary.innerHTML = [
      ["Позиція dunchoff", `#${s1.id} ${s1.name}`],
      ["Позиція чату", `#${s2.id} ${s2.name}`],
      ["Картки dunchoff", String(getCardsForPlayer(state, "dunchoff").length)],
      ["Картки чату", String(getCardsForPlayer(state, "chat").length)],
      ["Дія обраного поля", formatSectorAction(selected)],
    ].map(([key, value]) => `<div class="summary-item"><span>${key}</span><strong>${escapeHtml(value)}</strong></div>`).join("");
  }

  fillSectorTypeOptions(el);
  fillSectorActionOptions(el);
  if (el.sectorDialogTitle) el.sectorDialogTitle.textContent = `Поле #${selected.id}`;
  if (el.sectorNameInput) el.sectorNameInput.value = selected.name;
  if (el.sectorTypeInput) el.sectorTypeInput.value = selected.type;
  if (el.sectorColorInput) el.sectorColorInput.value = selected.color;
  if (el.sectorPointsInput) el.sectorPointsInput.value = selected.points;
  if (el.sectorTaglineInput) el.sectorTaglineInput.value = selected.tagline;
  if (el.sectorDescriptionInput) el.sectorDescriptionInput.value = selected.description;
  if (el.sectorActionInput) el.sectorActionInput.value = selected.action;
  if (el.sectorActionValueInput) el.sectorActionValueInput.value = selected.actionValue || "";
}

function fillSectorTypeOptions(el) {
  if (!el.sectorTypeInput || el.sectorTypeInput.dataset.ready === "true") return;
  el.sectorTypeInput.innerHTML = sectorTypes
    .map((type) => `<option value="${type.value}">${type.label}</option>`)
    .join("");
  el.sectorTypeInput.dataset.ready = "true";
}

function fillSectorActionOptions(el) {
  if (!el.sectorActionInput || el.sectorActionInput.dataset.ready === "true") return;
  el.sectorActionInput.innerHTML = sectorActions
    .map((action) => `<option value="${action.value}">${action.label}</option>`)
    .join("");
  el.sectorActionInput.dataset.ready = "true";
}

function renderReviewPanel(ctx) {
  const { el, store } = ctx;
  if (!el.reviewPanel) return;
  const sector = getPlayerSector(store.state, "dunchoff");
  if (el.reviewSectorHint) el.reviewSectorHint.textContent = `Поле #${sector.id}: ${sector.name}`;
  if (el.reviewTypeInput) el.reviewTypeInput.value = typeLabels[sector.type] || sector.type;
}

function saveReview() {
  if (!requireAuth()) return;
  const sector = getPlayerSector(store.state, "dunchoff");
  const title = el.reviewTitleInput?.value.trim() || "";
  const rawRating = Number(el.reviewRatingInput?.value || 0);
  const rating = Math.max(1, Math.min(10, rawRating));
  const text = el.reviewTextInput?.value.trim() || "";

  if (!title) {
    alert("Впиши назву перед збереженням.");
    return;
  }
  if (!rawRating) {
    alert("Постав оцінку від 1 до 10.");
    return;
  }

  store.state.reviews.unshift({
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    title,
    rating,
    text,
    playerKey: "dunchoff",
    playerName: store.state.players.dunchoff.name,
    sectorId: sector.id,
    sectorName: sector.name,
    sectorType: sector.type,
    createdAt: new Date().toISOString(),
  });
  store.state.reviews = store.state.reviews.slice(0, 120);

  if (el.reviewTitleInput) el.reviewTitleInput.value = "";
  if (el.reviewRatingInput) el.reviewRatingInput.value = "";
  if (el.reviewTextInput) el.reviewTextInput.value = "";
  addLog(store.state, "review", `Додано оцінку ${rating}/10 для "${title}".`);
  render();
}

function openReviews(ctx) {
  renderReviewsBody(ctx);
  openDialog(ctx.el.reviewsDialog);
}

function renderReviewsBody(ctx) {
  const { el, store } = ctx;
  if (!el.reviewsBody) return;
  const reviews = Array.isArray(store.state.reviews) ? store.state.reviews : [];
  if (reviews.length === 0) {
    el.reviewsBody.innerHTML = '<div class="event-row">Оцінок поки немає.</div>';
    return;
  }

  el.reviewsBody.innerHTML = reviews.map((review) => `
    <article class="review-item">
      <div>
        <strong>${escapeHtml(review.title)}</strong>
        <p>${escapeHtml(review.sectorName || "Поле")} · ${escapeHtml(typeLabels[review.sectorType] || review.sectorType || "")}</p>
        ${review.text ? `<p>${escapeHtml(review.text)}</p>` : ""}
      </div>
      <div class="review-score">
        <strong>${Number(review.rating || 0)}/10</strong>
        <span>${new Date(review.createdAt).toLocaleString("uk-UA")}</span>
      </div>
    </article>
  `).join("");
}

function openCardsGuide(ctx) {
  renderCardsGuide(ctx);
  openDialog(ctx.el.cardsGuideDialog);
}

function openGameRules(ctx) {
  const { el } = ctx;
  if (el.gameRulesBody) {
    el.gameRulesBody.innerHTML = `
      <section class="game-rules-hero">
        <p>DunchLand - це стрімова настільна гра, де фінальний вибір перегляду народжується з кидка кубиків, пропозицій чату і чесного колеса випадку.</p>
      </section>
      <section class="rules-grid">
        <article class="rule-item">
          <span>1</span>
          <div>
            <strong>Кидок наприкінці стріму</strong>
            <p>Вкінці стріму гравець кидає кубики й рухається по дошці. Поле, на яке він стає, задає критерій майбутнього перегляду: жанр, рік, формат, серіальний вайб, VIP-сектор або коротке переглядове завдання.</p>
          </div>
        </article>
        <article class="rule-item">
          <span>2</span>
          <div>
            <strong>Варіанти від чату</strong>
            <p>Після кидка учасники чату можуть запропонувати свої варіанти в коментарях Telegram-каналу <a href="https://t.me/dunchoff_live" target="_blank" rel="noreferrer">dunchoff_live</a>. Варіант має відповідати критерію сектора, щоб потрапити у відбір.</p>
          </div>
        </article>
        <article class="rule-item">
          <span>3</span>
          <div>
            <strong>Колесо на початку стріму</strong>
            <p>На початку наступного стріму стрімер додає варіанти в колесо. Усі варіанти мають рівні шанси, а колесо визначає, що саме дивимось цього разу.</p>
          </div>
        </article>
        <article class="rule-item">
          <span>4</span>
          <div>
            <strong>Картки змінюють партію</strong>
            <p>Картки можуть дати бонус, перекид, телепорт, рух вперед або штраф лідеру. Їх можна отримати через колесо карток, дії секторів або вручну під час гри.</p>
          </div>
        </article>
        <article class="rule-item">
          <span>5</span>
          <div>
            <strong>Відгук після перегляду</strong>
            <p>Після перегляду можна записати назву, оцінку до 10 балів і короткий відгук. Усе зберігається в щоденнику, щоб потім бачити історію переглядів і найкращі вибори чату.</p>
          </div>
        </article>
      </section>
    `;
  }
  openDialog(el.gameRulesDialog);
}

function renderCardsGuide(ctx) {
  const { el } = ctx;
  if (!el.cardsGuideBody) return;
  el.cardsGuideBody.innerHTML = bonusCards.map((card, index) => `
    <article class="guide-card-item">
      <img src="${card.image}" alt="${escapeHtml(card.title)}" onerror="this.src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='" />
      <div>
        <span class="card-preview-number">#${index + 1}</span>
        <strong>${escapeHtml(card.title)}</strong>
        <em>${escapeHtml(cardEffectLabels[card.effect] || card.effect)}</em>
        <p>${escapeHtml(card.text)}</p>
      </div>
    </article>
  `).join("");
}
