"use strict";

/* ===== scripts/render/dialogs.js ===== */

function openSectorInfo(ctx) {
  const { el, store } = ctx;
  const sector = getSelectedSector(store.state);
  const examples = Array.isArray(sector.examples) ? sector.examples : [];

  if (el.sectorInfoTitle) el.sectorInfoTitle.textContent = `${sector.name} #${sector.id}`;
  if (el.sectorInfoBody) {
    el.sectorInfoBody.innerHTML = `
      <div class="sector-detail-hero" style="--sector-color:${sector.color}">
        <span>${typeIcons[sector.type] || "."}</span>
        <div><strong>${typeLabels[sector.type] || sector.type}</strong><p>${escapeHtml(sector.tagline)}</p></div>
      </div>
      <p>${escapeHtml(sector.description)}</p>
      ${examples.length ? `
        <div class="examples-list">
          <span>Приклади</span>
          <p>${examples.map((item) => escapeHtml(item)).join(" / ")}</p>
        </div>
      ` : ""}
      <div class="detail-grid">
        <div><span>Очки</span><strong>${sector.points}</strong></div>
        <div><span>Дія</span><strong>${escapeHtml(formatSectorAction(sector))}</strong></div>
      </div>
    `;
  }
  openDialog(el.sectorInfoDialog);
}

function formatSectorAction(sector) {
  if (!sector.action) return "Без дії";
  const label = actionLabels[sector.action] || sector.action;
  if (sector.action === "penalty" || sector.action === "bonus") return `${label}: ${Number(sector.actionValue || 0) || 10} очок`;
  if (sector.action === "teleport") return `${label}: поле #${Number(sector.actionValue || 1)}`;
  return label;
}

function openRules(ctx) {
  const { el } = ctx;
  if (el.rulesBody) {
    el.rulesBody.innerHTML = `
      <section>
        <h3>Типи полів</h3>
        <div class="rules-grid">
          ${sectorTypes.map((type) => `
            <div class="rule-item">
              <span class="rule-image-wrap"><img src="${getSectorIconSrc(type.value)}" alt="${escapeHtml(type.label)}" /></span>
              <div><strong>${escapeHtml(type.label)}</strong><p>${escapeHtml(getTypeHint(type.value))}</p></div>
            </div>
          `).join("")}
        </div>
      </section>
      <section>
        <h3>Дії поля</h3>
        <div class="rules-grid">
          ${sectorActions.map((action) => `
            <div class="rule-item">
              <span class="rule-image-wrap"><img src="${getActionGuideImageSrc(action.value)}" alt="${escapeHtml(action.label)}" /></span>
              <div><strong>${escapeHtml(action.label)}</strong><p>${escapeHtml(action.hint)}</p></div>
            </div>
          `).join("")}
        </div>
      </section>
    `;
  }
  openDialog(el.rulesDialog);
}

function getActionGuideImageSrc(action) {
  if (action === "penalty") return "./assets/board/effects/penalty.png";
  if (action === "bonus") return "./assets/board/effects/bonus.png";
  if (action === "teleport") return "./assets/board/effects/teleport.png";
  if (action === "drawCard") return "./assets/board/effects/draw-card.png";
  return "./assets/board/effects/skip.png";
}

function getTypeHint(type) {
  const activeHints = {
    movie: "Критерій для вибору фільму: жанр, рік, настрій або формат.",
    series: "Критерій для вибору серіалу схожого плану.",
    youtube: "Переглядове поле для YouTube-роликів, оглядів або розборів.",
    tiktok: "Переглядове поле для коротких TikTok, Shorts або Reels.",
    vip: "Спеціалізоване поле для конкретного користувача.",
  };
  if (activeHints[type]) return activeHints[type];
  const hints = {
    start: "Початкова точка. За проходження старту гравець отримує бонус.",
    game: "Тематичне поле про ігри.",
    movie: "Категорії, сцени та вайб фільмів.",
    series: "Серіали, епізоди, фінали та персонажі.",
    youtube: "YouTube-теми, меми, ролики та інтернет-культура.",
    vip: "Особливе персональне поле з підвищеною нагородою.",
    bonus: "Дає картку, якщо на нього стає dunchoff.",
    railroad: "Перекидає до наступного поля-переходу.",
    prison: "Поле для паузи або штрафних правил.",
    parking: "Нейтральне поле відпочинку.",
  };
  return hints[type] || "Звичайна категорія дошки.";
}

function saveSector(ctx) {
  if (!requireAuth()) return;
  const { el, store } = ctx;
  const sector = getSelectedSector(store.state);

  if (el.sectorNameInput) sector.name = el.sectorNameInput.value.trim() || sector.name;
  if (el.sectorTypeInput) sector.type = el.sectorTypeInput.value;
  if (el.sectorColorInput) sector.color = el.sectorColorInput.value;
  if (el.sectorPointsInput) sector.points = Number(el.sectorPointsInput.value || 0);
  if (el.sectorTaglineInput) sector.tagline = el.sectorTaglineInput.value.trim() || "Тематична категорія";
  if (el.sectorDescriptionInput) sector.description = el.sectorDescriptionInput.value.trim() || "Опис поля.";
  if (el.sectorActionInput) sector.action = el.sectorActionInput.value.trim();
  if (el.sectorActionValueInput) sector.actionValue = Number(el.sectorActionValueInput.value || 0);

  addLog(store.state, "edit", `Оновлено поле #${sector.id}.`);
  closeDialog(el.sectorDialog);
  ctx.render();
}
