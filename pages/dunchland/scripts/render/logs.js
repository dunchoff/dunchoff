"use strict";

/* ===== scripts/render/logs.js ===== */

function renderLogs(ctx) {
  const { el, store } = ctx;
  if (!el.eventLog) return;

  el.eventLog.innerHTML = store.state.logs.slice().reverse().map((log) => `
    <div class="event-row"><strong>${new Date(log.time).toLocaleString("uk-UA")}</strong><br />${escapeHtml(log.message)}</div>
  `).join("");
}
