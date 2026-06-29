"use strict";

/* ===== scripts/render/board.js ===== */

function renderBoard(ctx) {
  const { el, store } = ctx;
  const { state } = store;
  if (!el.board) return;

  el.board.innerHTML = "";
  const center = document.createElement("div");
  center.className = "board-center";
  center.innerHTML = `
    <img src="./assets/bg/dunchland-chalkboard-icons.png" alt="DunchLand" />
  `;
  el.board.append(center);

  state.sectors.forEach((sector, index) => {
    const coords = boardPath[index];
    if (!coords) return;
    const [col, row] = coords;
    const node = document.createElement("button");
    node.type = "button";
    node.className = `sector sector-${sector.type} sector-id-${sector.id} ${sector.id === state.selectedSectorId ? "is-selected" : ""}`;
    node.style.gridColumn = String(col);
    node.style.gridRow = String(row);
    node.style.setProperty("--sector-color", sector.color);
    const iconSrc = getSectorIconSrc(sector.type);
    const effectSrc = getSectorEffectSrc(sector);
    const numberSrc = `./assets/board/numbers/${sector.id}.png`;
    node.innerHTML = `
      <img class="sector-main-image" src="${iconSrc}" alt="${escapeHtml(typeLabels[sector.type] || sector.type)}" draggable="false" />
      <img class="sector-effect-image" src="${effectSrc}" alt="${escapeHtml(formatSectorAction(sector))}" draggable="false" />
      <img class="sector-number-image" src="${numberSrc}" alt="${sector.id}" draggable="false" />
      ${state.players.dunchoff.sectorId === sector.id ? `<span class="player-token token-a ${store.landingPlayer === "dunchoff" ? "is-landing" : ""}" style="--player-color:${state.players.dunchoff.color};"></span>` : ""}
      ${state.players.chat.sectorId === sector.id ? `<span class="player-token token-b ${store.landingPlayer === "chat" ? "is-landing" : ""}" style="--player-color:${state.players.chat.color};"></span>` : ""}
    `;
    node.addEventListener("click", () => {
      state.selectedSectorId = sector.id;
      addLog(state, "select", `Відкрито поле #${sector.id}: ${sector.name}.`);
      ctx.render();
      ctx.openSectorInfo();
    });
    el.board.append(node);
  });
}

function getSectorIconSrc(type) {
  const iconMap = {
    movie: "movie",
    series: "series",
    youtube: "youtube",
    tiktok: "tiktok",
    vip: "vip",
  };
  return `./assets/board/icons/${iconMap[type] || "movie"}.png`;
}

function getSectorEffectSrc(sector) {
  if (sector.action === "penalty") return "./assets/board/effects/penalty.png";
  if (sector.action === "teleport") return "./assets/board/effects/teleport.png";
  if (sector.action === "drawCard") return "./assets/board/effects/draw-card.png";
  if (sector.action === "skipTurn") return "./assets/board/effects/skip.png";
  return "./assets/board/effects/bonus.png";
}
