"use strict";

/* ===== App bootstrap ===== */

const el = getElements();

const ctx = {
  el,
  store,
  render,
  drawCard: (source, playerKey = "dunchoff") => drawCard(ctx, source, playerKey),
  useCard: (playerKey, index) => useCard(ctx, playerKey, index),
  openSectorInfo: () => openSectorInfo(ctx),
  loadSlot,
  deleteSlot,
};

function render() {
  saveState(store.state);
  renderAuth();
  renderPlayers(ctx);
  renderBoard(ctx);
  renderSummary(ctx);
  renderReviewPanel(ctx);
  renderCards(ctx);
  renderLogs(ctx);
  renderWheels(ctx);
  renderSaveSlots(ctx);
}

function renderAuth() {
  if (el.authStatus) {
    el.authStatus.textContent = store.isAuthorized
      ? "dunchoff"
      : "Вхід";
  }
  if (el.loginControls) el.loginControls.hidden = store.isAuthorized;
  if (el.logoutBtn) el.logoutBtn.hidden = !store.isAuthorized;
  document.querySelectorAll("[data-auth-control]").forEach((node) => {
    node.hidden = !store.isAuthorized;
  });

  [
    el.rollBtn,
    el.editSectorBtn,
    el.drawCardBtn,
    el.drawChatCardBtn,
    el.clearLogBtn,
    el.resetGameBtn,
    el.saveSlotBtn,
    el.importInput,
    el.customWheelInput,
    el.saveReviewBtn,
    el.saveSectorBtn,
    el.spinCardWheelBtn,
    el.spinCustomWheelBtn,
  ].filter(Boolean).forEach((node) => {
    node.disabled = !store.isAuthorized || store.isRolling;
  });
}

function requireAuth() {
  if (store.isAuthorized) return true;
  alert("Спочатку увійди, щоб змінювати дані.");
  return false;
}

function login() {
  const loginValue = el.loginInput?.value.trim() || "";
  const passwordValue = el.passwordInput?.value || "";
  if (loginValue === AUTH_LOGIN && passwordValue === AUTH_PASSWORD) {
    store.isAuthorized = true;
    sessionStorage.setItem("dunchland-auth", "true");
    if (el.passwordInput) el.passwordInput.value = "";
    addLog(store.state, "auth", "Керування відкрито.");
    render();
    return;
  }
  alert("Невірний логін або пароль.");
}

function logout() {
  store.isAuthorized = false;
  sessionStorage.removeItem("dunchland-auth");
  if (el.loginInput) el.loginInput.value = "";
  if (el.passwordInput) el.passwordInput.value = "";
  addLog(store.state, "auth", "Керування закрито.");
  render();
}

async function onRoll() {
  if (store.isRolling) return;
  if (store.state.currentTurn !== "dunchoff") return;
  store.isRolling = true;
  renderAuth();
  if (consumeSkippedTurn("dunchoff")) {
    store.state.currentTurn = "chat";
    render();
    setTimeout(executeChatTurn, 600);
    return;
  }
  await rollPlayer(ctx, "dunchoff");
  store.state.currentTurn = "chat";
  addLog(store.state, "turn", "Хід dunchoff завершено, чат ходить авто.");
  render();
  setTimeout(executeChatTurn, 600);
}

async function executeChatTurn() {
  if (store.state.currentTurn !== "chat") return;
  if (consumeSkippedTurn("chat")) {
    store.state.currentTurn = "dunchoff";
    store.state.turnNumber += 1;
    store.isRolling = false;
    render();
    return;
  }
  await rollPlayer(ctx, "chat");
  store.state.currentTurn = "dunchoff";
  store.state.turnNumber += 1;
  addLog(store.state, "turn", "Хід чату завершено.");
  store.isRolling = false;
  render();
}

function consumeSkippedTurn(playerKey) {
  const player = store.state.players[playerKey];
  if (!player?.skipNextTurn) return false;
  player.skipNextTurn = false;
  player.lastRoll = null;
  addLog(store.state, "turn", `${player.name} пропускає хід.`);
  return true;
}

function saveSlot() {
  const name = prompt("Назва збереження:", `Хід ${store.state.turnNumber}`);
  if (!name) return;
  store.saveSlots.unshift(createSaveSlot(store.state, name));
  store.saveSlots = store.saveSlots.slice(0, 8);
  persistSaveSlots(store.saveSlots);
  addLog(store.state, "save", `Створено слот "${name}".`);
  render();
}

function loadSlot(id) {
  if (!requireAuth()) return;
  const slot = store.saveSlots.find((item) => item.id === id);
  if (!slot) return;
  store.state = normalizeState(slot.state);
  addLog(store.state, "save", `Завантажено слот "${slot.name}".`);
  render();
}

function deleteSlot(id) {
  if (!requireAuth()) return;
  store.saveSlots = store.saveSlots.filter((item) => item.id !== id);
  persistSaveSlots(store.saveSlots);
  render();
}

function resetState() {
  if (!confirm("Почати нову гру?")) return;
  store.state = createDefaultState();
  render();
}

function exportState() {
  const blob = new Blob([JSON.stringify({ state: store.state, saveSlots: store.saveSlots }, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "dunchland-save.json";
  a.click();
  URL.revokeObjectURL(url);
  addLog(store.state, "export", "Стан гри експортовано.");
  render();
}

function importState(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(String(reader.result));
      store.state = normalizeState(parsed.state || parsed);
      if (Array.isArray(parsed.saveSlots)) store.saveSlots = parsed.saveSlots;
      persistSaveSlots(store.saveSlots);
      addLog(store.state, "import", "Стан гри імпортовано.");
      render();
    } catch {
      alert("Не вдалося імпортувати файл.");
    }
  };
  reader.readAsText(file);
}

function clearLogs() {
  store.state.logs = [createLog("system", "Логи очищено.")];
  render();
}

function bindEvents() {
  if (el.loginBtn) el.loginBtn.addEventListener("click", login);
  if (el.logoutBtn) el.logoutBtn.addEventListener("click", logout);
  if (el.passwordInput) el.passwordInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") login();
  });
  if (el.rollBtn) el.rollBtn.addEventListener("click", () => { if (requireAuth()) onRoll(); });
  if (el.drawCardBtn) el.drawCardBtn.addEventListener("click", () => { if (!requireAuth()) return; drawCard(ctx, "вручну", "dunchoff"); render(); });
  if (el.drawChatCardBtn) el.drawChatCardBtn.addEventListener("click", () => { if (!requireAuth()) return; drawCard(ctx, "вручну", "chat"); render(); });
  if (el.clearLogBtn) el.clearLogBtn.addEventListener("click", () => { if (requireAuth()) clearLogs(); });
  if (el.openCardsGuideBtn) el.openCardsGuideBtn.addEventListener("click", () => openCardsGuide(ctx));
  if (el.closeCardsGuideBtn) el.closeCardsGuideBtn.addEventListener("click", () => closeDialog(el.cardsGuideDialog));
  if (el.openReviewsBtn) el.openReviewsBtn.addEventListener("click", () => openReviews(ctx));
  if (el.closeReviewsBtn) el.closeReviewsBtn.addEventListener("click", () => closeDialog(el.reviewsDialog));
  if (el.saveReviewBtn) el.saveReviewBtn.addEventListener("click", saveReview);

  if (el.openRulesBtn) el.openRulesBtn.addEventListener("click", () => openRules(ctx));
  if (el.closeRulesBtn) el.closeRulesBtn.addEventListener("click", () => closeDialog(el.rulesDialog));
  if (el.openGameRulesBtn) el.openGameRulesBtn.addEventListener("click", () => openGameRules(ctx));
  if (el.closeGameRulesBtn) el.closeGameRulesBtn.addEventListener("click", () => closeDialog(el.gameRulesDialog));
  if (el.openSectorInfoBtn) el.openSectorInfoBtn.addEventListener("click", () => openSectorInfo(ctx));
  if (el.editSectorBtn) el.editSectorBtn.addEventListener("click", () => { if (requireAuth()) openDialog(el.sectorDialog); });
  if (el.closeSectorInfoBtn) el.closeSectorInfoBtn.addEventListener("click", () => closeDialog(el.sectorInfoDialog));
  if (el.closeSectorDialogBtn) el.closeSectorDialogBtn.addEventListener("click", () => closeDialog(el.sectorDialog));
  if (el.cancelSectorBtn) el.cancelSectorBtn.addEventListener("click", () => closeDialog(el.sectorDialog));
  if (el.saveSectorBtn) el.saveSectorBtn.addEventListener("click", () => { if (requireAuth()) saveSector(ctx); });

  if (el.resetGameBtn) el.resetGameBtn.addEventListener("click", () => { if (requireAuth()) resetState(); });
  if (el.saveSlotBtn) el.saveSlotBtn.addEventListener("click", () => { if (requireAuth()) saveSlot(); });
  if (el.exportBtn) el.exportBtn.addEventListener("click", exportState);
  if (el.importInput) el.importInput.addEventListener("change", (event) => { if (requireAuth()) importState(event.target.files[0]); });

  if (el.openCardWheelBtn) el.openCardWheelBtn.addEventListener("click", () => openDialog(el.cardWheelDialog));
  if (el.openCustomWheelBtn) el.openCustomWheelBtn.addEventListener("click", () => {
    if (el.customWheelInput) el.customWheelInput.value = "";
    if (el.customWheelResult) el.customWheelResult.textContent = "Додай варіанти й крути.";
    if (el.customWheelDisk) paintWheel(el.customWheelDisk, []);
    openDialog(el.customWheelDialog);
  });
  if (el.closeCardWheelBtn) el.closeCardWheelBtn.addEventListener("click", () => closeDialog(el.cardWheelDialog));
  if (el.closeCustomWheelBtn) el.closeCustomWheelBtn.addEventListener("click", () => closeDialog(el.customWheelDialog));
  if (el.spinCardWheelBtn) el.spinCardWheelBtn.addEventListener("click", () => { if (requireAuth()) spinCardWheel(ctx); });
  if (el.spinCustomWheelBtn) el.spinCustomWheelBtn.addEventListener("click", () => { if (requireAuth()) spinCustomWheel(ctx); });

  if (el.customWheelInput) el.customWheelInput.addEventListener("change", () => {
    if (!requireAuth()) return render();
    store.state.customWheelValues = parseCustomValues(el.customWheelInput);
    render();
  });
}

window.onerror = function onRuntimeError(msg, url, line, col, error) {
  const errorMsg = `Runtime Error: ${msg} (at ${line}:${col})`;
  console.error(errorMsg, error);
  if (store.state) addLog(store.state, "error", errorMsg);
  return false;
};

async function bootstrap() {
  const gameData = await loadGameData();
  store.state = gameData.state || createDefaultState();
  store.saveSlots = gameData.saveSlots || [];
  bindEvents();
  render();

  if (store.state.currentTurn === "chat") {
  addLog(store.state, "system", "Продовжуємо хід чату...");
    setTimeout(executeChatTurn, 1000);
}
}

bootstrap();
