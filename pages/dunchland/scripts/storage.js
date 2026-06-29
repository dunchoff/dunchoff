"use strict";

/* ===== scripts/storage.js ===== */

const STORAGE_KEY = "dunchland-web-state-v4";
const LEGACY_STORAGE_KEYS = ["dunchland-web-state-v3"];
const SAVE_SLOTS_KEY = "dunchland-web-save-slots-v1";
const SUPABASE_URL = "https://ywjjwivrhtimigqzwbbr.supabase.co";
const SUPABASE_KEY = "sb_publishable_lxNmzDTHRxHSzKhFligi4g_BgBgJHzj";
const SUPABASE_STATE_TABLE = "dunchland_state";
const SUPABASE_STATE_ID = "current";

let saveTimer = null;
let isRemoteReady = false;
let lastSavePayload = "";
let lastSaveErrorMessage = "";

function loadLegacyState() {
  try {
    const raw = [STORAGE_KEY, ...LEGACY_STORAGE_KEYS]
      .map((key) => localStorage.getItem(key))
      .find(Boolean);
    return raw ? normalizeState(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}
function saveState(state) {
  if (state) queueRemoteSave();
}
function loadLegacySaveSlots() {
  try {
    const parsed = JSON.parse(localStorage.getItem(SAVE_SLOTS_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
function persistSaveSlots(saveSlots) {
  if (Array.isArray(saveSlots)) queueRemoteSave();
}
function createSaveSlot(state, name) {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    name,
    createdAt: new Date().toISOString(),
    state: clone(state),
  };
}

async function loadGameData() {
  try {
    const remote = await fetchSupabaseState();
    if (remote) {
      isRemoteReady = true;
      lastSavePayload = JSON.stringify({
        state: remote.state || null,
        saveSlots: Array.isArray(remote.save_slots) ? remote.save_slots : [],
      });
      return {
        state: remote.state ? normalizeState(remote.state) : null,
        saveSlots: Array.isArray(remote.save_slots) ? remote.save_slots : [],
      };
    }
  } catch (error) {
    console.warn("Supabase load failed", error);
  }

  const legacyState = loadLegacyState();
  const legacySaveSlots = loadLegacySaveSlots();
  isRemoteReady = true;
  return { state: legacyState, saveSlots: legacySaveSlots };
}

function queueRemoteSave() {
  if (!isRemoteReady || !store.state) return;
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => {
    persistGameData().catch((error) => {
      console.warn("Supabase save failed", error);
      const message = getSaveErrorMessage(error);
      if (store.state && message !== lastSaveErrorMessage) {
        addLog(store.state, "error", message);
        lastSaveErrorMessage = message;
      }
    });
  }, 450);
}

async function persistGameData() {
  const payload = {
    state: store.state,
    saveSlots: Array.isArray(store.saveSlots) ? store.saveSlots : [],
  };
  const serialized = JSON.stringify(payload);
  if (serialized === lastSavePayload) return;

  await upsertSupabaseState({
    id: SUPABASE_STATE_ID,
    state: payload.state,
    save_slots: payload.saveSlots,
    updated_at: new Date().toISOString(),
  });
  lastSavePayload = serialized;
  lastSaveErrorMessage = "";
}

async function fetchSupabaseState() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_STATE_TABLE}?id=eq.${encodeURIComponent(SUPABASE_STATE_ID)}&select=state,save_slots`, {
    headers: getSupabaseHeaders(),
  });
  if (!response.ok) throw await createSupabaseError("load", response);

  const rows = await response.json();
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}

async function upsertSupabaseState(payload) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_STATE_TABLE}`, {
    method: "POST",
    headers: {
      ...getSupabaseHeaders(),
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw await createSupabaseError("save", response);
}

function getSupabaseHeaders() {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
  };
}

async function createSupabaseError(action, response) {
  let body = "";
  try {
    body = await response.text();
  } catch {
    body = "";
  }
  const error = new Error(`Supabase ${action} ${response.status}`);
  error.status = response.status;
  error.body = body;
  return error;
}

function getSaveErrorMessage(error) {
  if (error?.status === 404 && String(error.body || "").includes("dunchland_state")) {
    return "Supabase: спочатку створи таблицю dunchland_state через SQL Editor.";
  }
  if (error?.status === 401 || error?.status === 403) {
    return "Supabase: немає доступу до збереження. Перевір ключ або RLS policies.";
  }
  return "Не вдалося зберегти стан у Supabase.";
}
