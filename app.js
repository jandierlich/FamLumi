// ============================================================
// FamLumi — App-Logik (reines JavaScript, keine Bibliotheken)
// Diese Datei ist eine LESBARE REFERENZ. Die laufende App laedt den
// Code inline aus index.html (kein externer Fetch, damit die App
// auch per Doppelklick lokal funktioniert). Diese Kopie wird bei
// Aenderungen an index.html mitgepflegt.
// ============================================================
// ============================================================
// FamLumi — App-Logik OHNE externe Abhängigkeiten (reines JavaScript)
// Kein React, kein Babel, kein CDN nötig für die Kernfunktionen.
// ============================================================

// ---------- Grunddaten ----------

const RITUAL_SENTENCES = [
  "Heute reicht gut genug.", "Wir schaffen das zusammen.", "Kleine Schritte, große Liebe.",
  "Du bist genau richtig hier.", "Atmen. Lächeln. Weiter.", "Jeder Tag hat seinen eigenen Klang.",
  "Wir hören einander zu.", "Fehler sind Lerngeschenke.", "Zeit füreinander ist das Größte.",
  "Dein Licht macht uns heller.", "Morgen ist auch noch ein Tag.", "Gemeinsam sind wir leiser mutig.",
  "Danke fürs Da-Sein.", "Liebe wächst beim Teilen.", "Ruhe ist auch Produktivität.",
  "Wir sind ein Team.", "Heute wählen wir Freundlichkeit.", "Du musst nicht alles können.",
  "Wir feiern das Kleine.", "Zusammen atmen wir tiefer.", "Ein Lächeln ändert alles.",
  "Wir passen aufeinander auf.", "Deine Idee zählt.", "Heute ist ein Werdetag.",
  "Wir lassen Perfektion los.", "Worte bauen Brücken.", "Du bist gesehen.",
  "Wir machen Platz für Freude.", "Langsam ist auch schnell.", "Unser Zuhause ist ein Gefühl.",
  "Wir fragen statt vermuten.", "Mut steht uns gut.", "Heute schreiben wir eine gute Geschichte.",
  "Wir dürfen Pause machen.", "Dein Herz kennt den Weg.", "Zuhören ist Liebe.",
  "Wir wachsen in alle Richtungen.", "Ein Danke wärmt zwei Herzen.", "Wir sind genug, genau so.",
  "Morgen leuchtet neu.",
];

const CODE_WORDS = ["SONNE", "MOND", "STERN", "WOLKE", "HERZ", "HAUS", "LICHT", "FLUSS", "WALD", "BLUME"];
const CONFETTI_COLORS = ["#C97B63", "#6FA28D", "#8879B0", "#BE7A97"];
// Bewusst zurückhaltendere, nicht-kindliche Avatar-Symbole statt Tiere.
const AVATAR_CHOICES = ["⭐", "🌙", "☀️", "🌊", "🍃", "🔥", "🌸", "💫", "🎯", "🌿", "✨", "🎈"];
const MEMBER_COLOR_CHOICES = ["var(--c1)", "var(--c2)", "var(--c3)", "var(--c4)", "var(--c5)", "var(--c6)", "var(--c7)"];
const DEFAULT_MEMBERS = [
  { id: "p1", name: "Mitglied 1", avatar: "⭐", color: "var(--c1)" },
  { id: "p2", name: "Mitglied 2", avatar: "🌙", color: "var(--c2)" },
  { id: "p3", name: "Mitglied 3", avatar: "🌊", color: "var(--c3)" },
];

const VISIBLE_COUNT = 10;
const STORAGE_KEY = "famlumi_data_v4";
const CODE_KEY = "famlumi_family_code";
const ONBOARDING_KEY = "famlumi_onboarding_seen";
const THEME_KEY = "famlumi_theme";
const FIREBASE_CONFIG_KEY = "famlumi_firebase_config";
const LOGIN_KEY = "famlumi_logged_in_member";
const SEEN_ACTIVITY_KEY = "famlumi_seen_activity";
const NOTIF_ENABLED_KEY = "famlumi_notifications_enabled";

let creationCounter = Date.now();
function nextId(prefix) { creationCounter += 1; return prefix + creationCounter; }
function nextTimestamp() { creationCounter += 1; return creationCounter; }

function defaultData() {
  // Bewusst KEINE Beispiel-Inhalte mehr - alle Listen starten leer und
  // füllen sich ausschließlich durch das, was die Familie selbst einträgt.
  return {
    members: JSON.parse(JSON.stringify(DEFAULT_MEMBERS)),
    tasks: [],
    events: [],
    chat: [],
    status: [
      { who: "p1", unterwegs: false, shareLocation: false, online: false },
      { who: "p2", unterwegs: false, shareLocation: false, online: false },
      { who: "p3", unterwegs: false, shareLocation: false, online: false },
    ],
  };
}

const TABS = [
  { key: "heute", label: "Heute", icon: "📌", color: "var(--c1)" },
  { key: "aufgaben", label: "Aufgaben", icon: "✅", color: "var(--c6)" },
  { key: "kalender", label: "Kalender", icon: "📅", color: "var(--c4)" },
  { key: "chat", label: "Chat", icon: "💬", color: "var(--c3)" },
  { key: "karte", label: "Karte", icon: "🗺️", color: "var(--c5)" },
  { key: "hinweise", label: "Hinweise", icon: "⚙️", color: "var(--c7)" },
];

// ---------- Zustand ----------

let state = defaultData();
let ui = {
  activeTab: "heute",
  familyCode: null,
  showSettingsModal: false,
  settingsMandatory: false, // erstes Setup: nicht schließbar, bis abgeschlossen
  settingsSelf: null, // im Setup gewähltes "das bin ich"
  showInstallModal: false,
  showOnboarding: false,
  showSyncModal: false,
  showReloginModal: false,
  myLocation: null, // { lat, lon } - einmalig fürs Zentrieren der Karte, wird nicht gespeichert
  editing: null, // { type: 'task'|'event', id }
  showAllTasks: false,
  showAllChat: false,
  theme: "light",
  syncStatus: "off", // "off" | "connected" | "error"
  loggedInMemberId: null,
  mapExpanded: false,
  seenActivityIds: new Set(),
  notificationsEnabled: false,
  calendarYear: new Date().getFullYear(),
  calendarMonth: new Date().getMonth(), // 0-basiert
  calendarSelectedDate: todayDateStr(),
};

// ---------- Hilfsfunktionen ----------

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}
function sortNewestFirst(items) { return [...items].sort((a, b) => b.createdAt - a.createdAt); }
function splitVisible(items, count) { return { visible: items.slice(0, count), hidden: items.slice(count) }; }
function eventDateTime(ev) { return new Date(ev.date + "T" + (ev.timeFrom || ev.time || "00:00")); }
function sortByDateAsc(items) { return [...items].sort((a, b) => eventDateTime(a) - eventDateTime(b)); }
function eventTimeLabel(ev) {
  const from = ev.timeFrom || ev.time || "";
  if (!from) return "Ganztägig";
  return ev.timeTo ? `${from}–${ev.timeTo} Uhr` : `${from} Uhr`;
}
function formatEventDate(ev) {
  const d = eventDateTime(ev);
  const dateTxt = d.toLocaleDateString("de-DE", { weekday: "short", day: "2-digit", month: "2-digit", year: "numeric" });
  const from = ev.timeFrom || ev.time;
  return from ? `${dateTxt} · ${from}${ev.timeTo ? "–" + ev.timeTo : ""}` : dateTxt;
}
function nextEvent() {
  const now = new Date();
  const upcoming = state.events.filter((ev) => eventDateTime(ev) >= now);
  if (!upcoming.length) return null;
  return sortByDateAsc(upcoming)[0];
}

// ---------- Kalender-Hilfsfunktionen (echte Monatsansicht) ----------
const MONTH_NAMES_DE = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
const WEEKDAY_LABELS_DE = ["Mo","Di","Mi","Do","Fr","Sa","So"];
function pad2(n) { return String(n).padStart(2, "0"); }
function dateToStr(d) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }
function todayDateStr() { return dateToStr(new Date()); }
function daysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
// JS getDay(): 0=So..6=Sa. Wir wollen Montag als ersten Wochentag (0=Mo..6=So).
function mondayIndex(weekday) { return (weekday + 6) % 7; }
function eventsOnDate(dateStr) { return sortByDateAsc(state.events.filter((ev) => ev.date === dateStr)); }
function formatSelectedDayLabel(dateStr) {
  const d = new Date(dateStr + "T00:00");
  return d.toLocaleDateString("de-DE", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" });
}
function memberById(id) { return state.members.find((m) => m.id === id) || { name: id, avatar: "👤", color: "var(--c1)" }; }
function statusById(id) { return state.status.find((s) => s.who === id); }
function greetingForNow() {
  const h = new Date().getHours();
  if (h < 11) return "Guten Morgen, ihr Lieben";
  if (h < 17) return "Schönen Tag, ihr Lieben";
  if (h < 22) return "Schönen Abend, ihr Lieben";
  return "Gute Nacht, ihr Lieben";
}
function dayOfYear() { return Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 86400000); }
function sentenceOfTheDay() { return RITUAL_SENTENCES[dayOfYear() % RITUAL_SENTENCES.length]; }
function generateFamilyCode() {
  const word = CODE_WORDS[Math.floor(Math.random() * CODE_WORDS.length)];
  return `${word}-${Math.floor(1000 + Math.random() * 9000)}`;
}
function loadSavedData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) { return null; }
}
function saveData() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (e) { /* z.B. privater Modus */ }
}

function burstConfetti(originEl) {
  if (!originEl) return;
  const rect = originEl.getBoundingClientRect();
  for (let i = 0; i < 16; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = rect.left + rect.width / 2 + (Math.random() * 60 - 30) + "px";
    piece.style.top = rect.top + "px";
    piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    piece.style.animationDelay = Math.random() * 0.15 + "s";
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 1400);
  }
}
function playTapFeedback() {
  if (navigator.vibrate) navigator.vibrate(12);
  if (!state.soundOn) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine"; osc.frequency.value = 720;
    gain.gain.setValueAtTime(0.06, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain).connect(ctx.destination);
    osc.start(); osc.stop(ctx.currentTime + 0.25);
  } catch (e) {}
}

// Einmalige, stille Standortabfrage nur fürs Zentrieren der Karte im
// Karte-Tab (kein Wetter mehr, kein Speichern, keine Übermittlung an Dritte).
function loadOwnLocation() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      ui.myLocation = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      if (ui.activeTab === "karte") render();
    },
    () => {},
    { timeout: 6000 }
  );
}

// ---------- Aktionen ----------

const actions = {
  addTask(text) {
    if (!text.trim()) return;
    const ts = nextTimestamp();
    const who = ui.loggedInMemberId || state.members[0].id;
    const id = nextId("t");
    state.tasks.unshift({ id, text: text.trim(), who, done: false, completedBy: null, createdAt: ts, updatedAt: ts });
    saveData();
    lastAddedId = id;
    render();
    lastAddedId = null;
  },
  toggleChecked(id, btnEl) {
    const task = state.tasks.find((t) => t.id === id);
    if (!task) return;
    if (!task.done) {
      burstConfetti(btnEl);
      playTapFeedback();
      task.done = true; task.updatedAt = Date.now();
      task.completedBy = ui.loggedInMemberId || state.members[0].id;
    } else {
      task.done = false; task.completedBy = null; task.updatedAt = Date.now();
    }
    saveData();
    lastToggledTaskId = id;
    render();
    lastToggledTaskId = null;
  },
  thank(id, btnEl) {
    burstConfetti(btnEl);
    playTapFeedback();
    const task = state.tasks.find((t) => t.id === id);
    if (task) {
      task.done = true; task.updatedAt = Date.now();
      task.completedBy = ui.loggedInMemberId || state.members[0].id;
    }
    saveData();
    lastToggledTaskId = id;
    render();
    lastToggledTaskId = null;
  },
  startEditTask(id) { ui.editing = { type: "task", id }; render(); },
  saveEditTask(id) {
    const val = document.getElementById("edit-inline-input");
    const task = state.tasks.find((t) => t.id === id);
    if (task && val) { task.text = val.value; task.updatedAt = Date.now(); }
    ui.editing = null; saveData(); render();
  },
  cancelEdit() { ui.editing = null; render(); },
  deleteTask(id) { state.tasks = state.tasks.filter((t) => t.id !== id); saveData(); render(); },
  expandTasks() { ui.showAllTasks = true; render(); },

  addEvent(title, date, timeFrom, timeTo) {
    if (!title.trim() || !date) return;
    const ts = nextTimestamp();
    const who = ui.loggedInMemberId || state.members[0].id;
    const id = nextId("e");
    state.events.push({ id, title: title.trim(), date, timeFrom: timeFrom || "", timeTo: timeTo || "", who, createdAt: ts, updatedAt: ts });
    saveData();
    lastAddedId = id;
    render();
    lastAddedId = null;
  },
  // Termine können von jedem Familienmitglied bearbeitet und gelöscht werden.
  startEditEvent(id) { ui.editing = { type: "event", id }; render(); },
  saveEditEvent(id) {
    const titleVal = document.getElementById("edit-event-title");
    const dateVal = document.getElementById("edit-event-date");
    const fromVal = document.getElementById("edit-event-time-from");
    const toVal = document.getElementById("edit-event-time-to");
    const ev = state.events.find((e) => e.id === id);
    if (ev && titleVal && titleVal.value.trim() && dateVal && dateVal.value) {
      ev.title = titleVal.value.trim(); ev.date = dateVal.value;
      ev.timeFrom = fromVal ? fromVal.value : ""; ev.timeTo = toVal ? toVal.value : "";
      delete ev.time; // altes Einzel-Zeitfeld-Format bereinigen
      ev.updatedAt = Date.now();
    }
    ui.editing = null; saveData(); render();
  },
  deleteEvent(id) { state.events = state.events.filter((e) => e.id !== id); saveData(); render(); },
  calPrevMonth() {
    ui.calendarMonth -= 1;
    if (ui.calendarMonth < 0) { ui.calendarMonth = 11; ui.calendarYear -= 1; }
    calendarSlideDir = "right";
    render();
    calendarSlideDir = null;
  },
  calNextMonth() {
    ui.calendarMonth += 1;
    if (ui.calendarMonth > 11) { ui.calendarMonth = 0; ui.calendarYear += 1; }
    calendarSlideDir = "left";
    render();
    calendarSlideDir = null;
  },
  calSelectDay(dateStr) {
    if (!dateStr) return;
    ui.calendarSelectedDate = dateStr;
    const [y, m] = dateStr.split("-").map(Number);
    ui.calendarYear = y; ui.calendarMonth = m - 1;
    render();
  },

  toggleUnterwegs(who) {
    const s = statusById(who);
    if (s) s.unterwegs = !s.unterwegs;
    saveData(); render();
  },
  toggleShareLocation(who) {
    // Nur die angemeldete Person darf ihre eigene Standortfreigabe umschalten.
    if (who !== ui.loggedInMemberId) return;
    const s = statusById(who);
    if (s) s.shareLocation = !s.shareLocation;
    saveData(); render();
  },

  sendChat(text) {
    if (!text.trim()) return;
    const sender = ui.loggedInMemberId || state.members[0].id;
    const id = nextId("c");
    state.chat.unshift({ id, who: sender, text: text.trim(), createdAt: nextTimestamp(), reactions: 0 });
    saveData();
    lastAddedId = id;
    render();
    lastAddedId = null;
  },
  reactChat(id) {
    const msg = state.chat.find((m) => m.id === id);
    if (msg) msg.reactions = (msg.reactions || 0) + 1;
    saveData(); render();
  },
  deleteChat(id) { state.chat = state.chat.filter((m) => m.id !== id); saveData(); render(); },
  expandChat() { ui.showAllChat = true; render(); },

  updateMemberAvatar(id, avatar) {
    actions.updateMemberNamesFromForm(); // getippte, noch ungespeicherte Namen zuerst sichern
    const m = state.members.find((m) => m.id === id);
    if (m) m.avatar = avatar;
    saveData(); render();
  },
  updateMemberColor(id, color) {
    actions.updateMemberNamesFromForm();
    const m = state.members.find((m) => m.id === id);
    if (m) m.color = color;
    saveData(); render();
  },
  updateMemberNamesFromForm() {
    state.members.forEach((m) => {
      const input = document.getElementById("member-name-" + m.id);
      if (input) m.name = input.value.trim() || m.name;
    });
    saveData();
  },
  pickSelf(id) { actions.updateMemberNamesFromForm(); ui.settingsSelf = id; render(); },

  gotoTab(key) { ui.activeTab = key; ui.showAllTasks = false; ui.showAllChat = false; render(); },
  openActivityItem(tab, itemId) {
    ui.seenActivityIds.add(itemId);
    saveSeenActivityIds();
    actions.gotoTab(tab);
  },
  resetSeenActivity() {
    ui.seenActivityIds = new Set();
    saveSeenActivityIds();
    render();
  },
  showSettings() { ui.showSettingsModal = true; ui.settingsMandatory = false; render(); },
  closeSettings() {
    actions.updateMemberNamesFromForm();
    ui.showSettingsModal = false;
    render();
  },
  // Erstes, verpflichtendes Setup: nicht per Backdrop/X schließbar, erst
  // "Fertig" möglich, wenn eine Person sich selbst zugeordnet hat.
  finishMandatorySetup() {
    actions.updateMemberNamesFromForm();
    if (!ui.settingsSelf) return;
    ui.loggedInMemberId = ui.settingsSelf;
    localStorage.setItem(LOGIN_KEY, ui.settingsSelf);
    const s = statusById(ui.settingsSelf);
    if (s) s.online = true;
    ui.showSettingsModal = false;
    ui.settingsMandatory = false;
    saveData(); render();
  },

  showInstall() { ui.showInstallModal = true; render(); },
  closeInstall() { ui.showInstallModal = false; render(); },
  toggleSound() { state.soundOn = !state.soundOn; saveData(); render(); },
  toggleNotifications() {
    if (!("Notification" in window)) { alert("Benachrichtigungen werden von diesem Browser nicht unterstützt."); return; }
    if (ui.notificationsEnabled) {
      ui.notificationsEnabled = false;
      localStorage.setItem(NOTIF_ENABLED_KEY, "0");
      render();
      return;
    }
    if (Notification.permission === "denied") {
      alert("Benachrichtigungen sind für FamLumi in den iPhone-Einstellungen blockiert. Bitte unter Einstellungen → Mitteilungen → FamLumi erlauben und danach hier erneut antippen.");
      return;
    }
    Notification.requestPermission().then((perm) => {
      ui.notificationsEnabled = perm === "granted";
      localStorage.setItem(NOTIF_ENABLED_KEY, ui.notificationsEnabled ? "1" : "0");
      render();
    });
  },
  expandMap() { ui.mapExpanded = true; render(); },
  closeMapModal() { ui.mapExpanded = false; render(); },

  toggleTheme() {
    ui.theme = ui.theme === "dark" ? "light" : "dark";
    localStorage.setItem(THEME_KEY, ui.theme);
    document.documentElement.setAttribute("data-theme", ui.theme);
    render();
  },

  dismissOnboarding() {
    ui.showOnboarding = false;
    localStorage.setItem(ONBOARDING_KEY, "1");
    if (!ui.loggedInMemberId) {
      ui.showSettingsModal = true;
      ui.settingsMandatory = true;
    }
    render();
  },

  logout() {
    if (!confirm("Wirklich abmelden? Du kannst dich mit dem Familien-Code jederzeit wieder anmelden.")) return;
    const s = statusById(ui.loggedInMemberId);
    if (s) s.online = false;
    ui.loggedInMemberId = null;
    localStorage.removeItem(LOGIN_KEY);
    saveData();
    ui.showReloginModal = true;
    render();
  },
  relogin(id) {
    ui.loggedInMemberId = id;
    localStorage.setItem(LOGIN_KEY, id);
    const s = statusById(id);
    if (s) s.online = true;
    ui.showReloginModal = false;
    saveData(); render();
  },

  // ---------- Backup: echte Datei statt nur Zwischenablage ----------
  downloadBackup() {
    const payload = { ...state, familyCode: ui.familyCode, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const dateStr = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `famlumi-backup-${dateStr}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  },
  restoreBackupFromFile(file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (!data || !Array.isArray(data.tasks)) throw new Error("Ungültiges Format");
        if (!confirm("Backup einspielen? Das ersetzt alle aktuellen Daten auf diesem Gerät.")) return;
        state = Object.assign(defaultData(), data);
        saveData();
        render();
        alert("Backup wurde eingespielt.");
      } catch (err) {
        alert("Diese Datei konnte nicht gelesen werden - ist es wirklich ein FamLumi-Backup?");
      }
    };
    reader.readAsText(file);
  },

  // ---------- Cloud-Sync (Firebase, optional) ----------
  showSync() { ui.showSyncModal = true; render(); },
  closeSync() { ui.showSyncModal = false; render(); },
  saveSyncConfig() {
    const textarea = document.getElementById("sync-config-input");
    if (!textarea) return;
    const config = parseFirebaseConfigInput(textarea.value);
    if (!config) {
      alert("Das sah nicht nach gültigen Firebase-Zugangsdaten aus. Bitte den ganzen Block noch einmal aus der Firebase-Konsole kopieren und einfügen.");
      return;
    }
    localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
    ui.syncStatus = "connecting";
    render();
    initFirebaseSync();
  },
  disconnectSync() {
    localStorage.removeItem(FIREBASE_CONFIG_KEY);
    firebaseApp = null; firebaseDb = null;
    ui.syncStatus = "off";
    render();
  },
};

// ---------- Rendering ----------

function renderHeader() {
  const avatars = state.members.map((m) => {
    const s = statusById(m.id);
    return `<button class="avatar-btn" style="background:${m.color}" data-action="show-settings" title="Namen & Avatar ändern">${m.avatar}${s && s.online ? '<span class="online-dot"></span>' : ""}</button>`;
  }).join("");
  return `
    <div class="hero">
      <div class="container" style="padding:0;">
        <div class="hero-top">
          <div class="logo">FamLumi</div>
          <div class="hero-top-right">
            <div class="hero-controls">
              <button class="hero-icon-btn" data-action="toggle-sound" title="Ton">${state.soundOn ? "🔊" : "🔇"}</button>
              <button class="hero-icon-btn" data-action="toggle-theme" title="Hell/Dunkel">${ui.theme === "dark" ? "☀️" : "🌙"}</button>
            </div>
            <div class="avatar-row">${avatars}</div>
          </div>
        </div>
        <div class="greeting">${greetingForNow()} ✨</div>
      </div>
    </div>`;
}

function renderNav() {
  return `<div class="bottom-nav">${TABS.map((t) => `
    <button class="nav-item${ui.activeTab === t.key ? " active" : ""}" style="--tabcolor:${t.color}" data-action="goto-tab" data-tab="${t.key}">
      <span class="nav-label">${t.label}</span>
    </button>`).join("")}</div>`;
}

const ACTIVITY_META = {
  aufgabe: { icon: "✅", color: "var(--c6)", tab: "aufgaben", label: "Aufgabe" },
  termin: { icon: "📅", color: "var(--c4)", tab: "kalender", label: "Termin" },
  chat: { icon: "💬", color: "var(--c3)", tab: "chat", label: "Chat" },
};
function buildActivityFeed() {
  const groups = { aufgabe: [], termin: [], chat: [] };
  state.tasks.forEach((t) => groups.aufgabe.push({ id: t.id, kind: "aufgabe", who: t.who, text: t.text, createdAt: t.createdAt, done: t.done, completedBy: t.completedBy }));
  state.events.forEach((ev) => groups.termin.push({ id: ev.id, kind: "termin", who: ev.who, text: `${ev.title} (${formatEventDate(ev)})`, createdAt: ev.createdAt }));
  state.chat.forEach((c) => groups.chat.push({ id: c.id, kind: "chat", who: c.who, text: c.text, createdAt: c.createdAt }));
  Object.keys(groups).forEach((k) => groups[k].sort((a, b) => b.createdAt - a.createdAt));
  return groups;
}

function loadSeenActivityIds() {
  try { return new Set(JSON.parse(localStorage.getItem(SEEN_ACTIVITY_KEY) || "[]")); } catch (e) { return new Set(); }
}
function saveSeenActivityIds() {
  try { localStorage.setItem(SEEN_ACTIVITY_KEY, JSON.stringify([...ui.seenActivityIds])); } catch (e) {}
}

function renderHeuteTab() {
  const groups = buildActivityFeed();
  const totalCount = groups.aufgabe.length + groups.termin.length + groups.chat.length;
  const next = nextEvent();
  const nextEventHtml = next
    ? `<button class="activity-row" style="--rowc:var(--c4);" data-action="goto-tab" data-tab="kalender">
        <span class="activity-icon">📅</span>
        <div class="activity-body">
          <div class="activity-who">${formatEventDate(next)}</div>
          <div class="activity-txt">${escapeHtml(next.title)}</div>
        </div>
        <span style="opacity:0.35;font-size:13px;">›</span>
      </button>`
    : `<div class="empty-state"><span class="empty-emoji">📅</span>Noch kein Termin eingetragen.</div>`;

  const rowHtml = (item) => {
    const meta = ACTIVITY_META[item.kind];
    const m = memberById(item.who);
    const isTask = item.kind === "aufgabe";
    const unread = !ui.seenActivityIds.has(item.id);
    const icon = isTask
      ? `<span class="${checkCircleClass(item)}" style="--rowc:${meta.color};pointer-events:none;">${checkCircleContent(item)}</span>`
      : `<span class="activity-icon">${meta.icon}</span>`;
    return `<button class="activity-row" style="--rowc:${meta.color}" data-action="open-activity-item" data-tab="${meta.tab}" data-item-id="${item.id}">
      ${icon}
      <div class="activity-body">
        <div class="activity-who">${escapeHtml(m.name)} · ${meta.label}</div>
        <div class="activity-txt${unread ? " unread" : ""}">${escapeHtml(item.text)}</div>
      </div>
      <span style="opacity:0.35;font-size:13px;">›</span>
    </button>`;
  };

  const PLURAL = { aufgabe: "Aufgaben", termin: "Termine", chat: "Nachrichten" };
  const moreBtnHtml = (kind, total) => {
    if (total <= 2) return "";
    const meta = ACTIVITY_META[kind];
    return `<button class="more-link" data-action="goto-tab" data-tab="${meta.tab}">Alle ${total} ${PLURAL[kind]} ansehen →</button>`;
  };

  const feedRows = ["aufgabe", "termin", "chat"].map((kind) => {
    const items = groups[kind].slice(0, 2);
    if (!items.length) return "";
    return items.map(rowHtml).join("") + moreBtnHtml(kind, groups[kind].length);
  }).join("") || `<div class="empty-state"><span class="empty-emoji">👋</span>Noch nichts eingetragen – legt oben in den Tabs los.</div>`;

  return `
    <div class="spotlight">
      <div class="spotlight-label">✨ Satz des Tages</div>
      <div class="spotlight-txt">„${escapeHtml(sentenceOfTheDay())}"</div>
    </div>

    <div class="section">
      <div class="section-head"><h2 class="section-title" style="font-size:16px;color:var(--c4);">Nächster Termin</h2></div>
      ${nextEventHtml}
    </div>

    <div class="section">
      <div class="section-head">
        <h2 class="section-title" style="font-size:16px;color:var(--c4);">Neu von der Familie</h2>
        ${totalCount ? `<button data-action="reset-seen-activity" style="background:none;border:none;font-size:11px;font-weight:700;color:var(--ink-soft);opacity:0.65;">↺ Ungelesen</button>` : ""}
      </div>
      ${feedRows}
    </div>`;
}

function checkCircleClass(task) {
  const justToggled = lastToggledTaskId === task.id;
  return `check-circle${task.done ? " checked" : ""}${task.done && task.completedBy ? " with-name" : ""}${justToggled ? " just-toggled" : ""}`;
}
function checkCircleContent(task) {
  if (task.done && task.completedBy) {
    const completer = memberById(task.completedBy);
    return `<span class="check-circle-info">${escapeHtml(completer.name)}</span>`;
  }
  return task.done ? "✓" : "";
}
function renderCheckCircleButton(task, color) {
  return `<button class="${checkCircleClass(task)}" style="--rowc:${color}" data-action="toggle-checked" data-id="${task.id}" title="Von jedem Familienmitglied abhakbar">${checkCircleContent(task)}</button>`;
}

function renderAufgabenTab() {
  const tasks = sortNewestFirst(state.tasks);
  const { visible, hidden } = splitVisible(tasks, VISIBLE_COUNT);
  const shownTasks = ui.showAllTasks ? tasks : visible;

  const taskRows = shownTasks.map((task) => {
    const m = memberById(task.who);
    const editing = ui.editing && ui.editing.type === "task" && ui.editing.id === task.id;
    if (editing) {
      return `<div class="task-row" style="--rowc:${m.color}">
        <input id="edit-inline-input" class="edit-row-input" value="${escapeHtml(task.text)}" />
        <button class="icon-btn pill-confirm" data-action="save-edit-task" data-id="${task.id}">✓</button>
      </div>`;
    }
    return `<div class="task-row${task.id === lastAddedId ? " just-added" : ""}" style="--rowc:${m.color}">
      ${renderCheckCircleButton(task, m.color)}
      <div class="task-body">
        <div class="task-who">${escapeHtml(m.name)}</div>
        <div class="task-txt${task.done ? " done" : ""}">${escapeHtml(task.text)}</div>
      </div>
      ${!task.done ? `<button class="thank-btn" data-action="thank" data-id="${task.id}">Danke →</button>` : `<div class="task-actions"><span style="font-size:16px;">💛</span></div>`}
      <div class="task-actions">
        <button class="icon-btn pill-edit" data-action="start-edit-task" data-id="${task.id}">✎</button>
        <button class="icon-btn pill-danger" data-action="delete-task" data-id="${task.id}">✕</button>
      </div>
    </div>`;
  }).join("") || `<div class="empty-state"><span class="empty-emoji">📝</span>Noch keine Aufgabe eingetragen – trag oben die erste ein.</div>`;

  return `
    <div class="section-head"><h2 class="section-title" style="color:var(--c6);">Aufgaben</h2></div>
    <div class="floating-field" style="margin-bottom:12px;">
      <input id="new-task-input" placeholder="Neue Aufgabe…" />
      <button class="send icon-btn" data-action="add-task">➤</button>
    </div>
    ${taskRows}
    ${!ui.showAllTasks && hidden.length > 0 ? `<button class="stack-pile" data-action="expand-tasks">🗂 +${hidden.length} ältere Aufgaben anzeigen</button>` : ""}`;
}

function renderKalenderTab() {
  const year = ui.calendarYear, month = ui.calendarMonth;
  const today = todayDateStr();
  const selected = ui.calendarSelectedDate || today;

  // ---------- Monats-Grid bauen ----------
  const firstWeekday = mondayIndex(new Date(year, month, 1).getDay());
  const numDays = daysInMonth(year, month);
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= numDays; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const weekdayHead = WEEKDAY_LABELS_DE.map((w) => `<div class="cal-weekday">${w}</div>`).join("");
  const dayCells = cells.map((d) => {
    if (!d) return `<div class="cal-day empty"></div>`;
    const dateStr = `${year}-${pad2(month + 1)}-${pad2(d)}`;
    const hasEvents = eventsOnDate(dateStr).length > 0;
    const classes = ["cal-day"];
    if (dateStr === today) classes.push("today");
    if (dateStr === selected) classes.push("selected");
    return `<button class="${classes.join(" ")}" data-action="cal-select-day" data-date="${dateStr}">
      <span>${d}</span>
      ${hasEvents ? `<span class="cal-dot"></span>` : ""}
    </button>`;
  }).join("");

  // ---------- Termine des ausgewählten Tages ----------
  const selectedEvents = eventsOnDate(selected);
  const renderRow = (ev) => {
    const m = memberById(ev.who);
    const editing = ui.editing && ui.editing.type === "event" && ui.editing.id === ev.id;
    if (editing) {
      return `<div class="event-card">
        <input id="edit-event-title" class="edit-row-input" style="width:100%;margin-bottom:8px;" value="${escapeHtml(ev.title)}" />
        <div style="display:flex;gap:6px;align-items:center;margin-bottom:8px;">
          <input id="edit-event-date" type="date" class="date-field" value="${ev.date}" />
        </div>
        <div style="display:flex;gap:6px;align-items:center;">
          <input id="edit-event-time-from" type="time" class="time-field" value="${ev.timeFrom || ev.time || ""}" />
          <span style="font-size:12px;opacity:0.5;flex-shrink:0;">bis</span>
          <input id="edit-event-time-to" type="time" class="time-field" value="${ev.timeTo || ""}" />
          <button class="icon-btn pill-confirm" data-action="save-edit-event" data-id="${ev.id}">✓</button>
        </div>
      </div>`;
    }
    return `<div class="event-card${ev.id === lastAddedId ? " just-added" : ""}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;">
        <div>
          <div class="event-date-badge">${eventTimeLabel(ev)}</div>
          <div class="event-title">${escapeHtml(ev.title)}</div>
          <div class="event-who">eingetragen von ${escapeHtml(m.name)}</div>
        </div>
        <div style="display:flex;gap:4px;flex-shrink:0;">
          <button class="icon-btn pill-edit" data-action="start-edit-event" data-id="${ev.id}" title="Von jedem Familienmitglied bearbeitbar">✎</button>
          <button class="icon-btn pill-danger" data-action="delete-event" data-id="${ev.id}">✕</button>
        </div>
      </div>
    </div>`;
  };
  const selectedRows = selectedEvents.length
    ? selectedEvents.map(renderRow).join("")
    : `<p style="font-size:13px;opacity:0.55;margin:0 0 4px;">Noch kein Termin an diesem Tag.</p>`;

  // Der Fingertipp auf einen Tagesbutton wählt den Tag aus UND öffnet direkt
  // darunter das Eingabefeld für einen neuen Termin an diesem Tag - ein
  // gesondertes Datumsfeld braucht es dafür nicht mehr, da der Tag bereits
  // durch den Tipp feststeht.
  const addForm = `
    <div class="floating-field" style="margin-top:10px;margin-bottom:8px;">
      <input id="new-event-title-input" placeholder="Neuer Termin…" />
    </div>
    <div style="display:flex;gap:6px;align-items:center;">
      <input id="new-event-time-from-input" type="time" class="time-field" />
      <span style="font-size:12px;opacity:0.5;flex-shrink:0;">bis</span>
      <input id="new-event-time-to-input" type="time" class="time-field" />
      <button class="send icon-btn" data-action="add-event">➤</button>
    </div>`;

  return `
    <div class="section-head"><h2 class="section-title" style="color:var(--c4);">Kalender</h2></div>
    <p style="font-size:13px;opacity:0.65;margin-top:-6px;margin-bottom:14px;">Ein gemeinsamer Kalender – jeder in der Familie kann Termine eintragen, bearbeiten und löschen.</p>

    <div class="cal-header">
      <button class="cal-nav-btn" data-action="cal-prev-month">‹</button>
      <div class="cal-month-label">${MONTH_NAMES_DE[month]} ${year}</div>
      <button class="cal-nav-btn" data-action="cal-next-month">›</button>
    </div>
    <div class="cal-grid${calendarSlideDir ? " slide-" + calendarSlideDir : ""}">${weekdayHead}${dayCells}</div>

    <div class="cal-day-detail-head">Termine am ${formatSelectedDayLabel(selected)}</div>
    ${selectedRows}
    ${addForm}`;
}


function renderKarteTab() {
  return `
    <div class="section-head"><h2 class="section-title" style="color:var(--c5);">Karte</h2></div>
    <button id="leaflet-map" class="map-tap-open" data-action="expand-map"><div id="map-fallback" class="skeleton skeleton-map" style="display:grid;place-items:center;text-align:center;padding:1rem;font-size:12px;color:var(--ink-soft);">🗺️ Karte lädt … (braucht Internet)</div></button>
    <div style="font-size:11px;opacity:0.45;margin-top:6px;text-align:center;">Antippen zum Vergrößern</div>
    <div class="section">
      <div class="section-head"><h2 class="section-title" style="font-size:16px;color:var(--c5);">Meine Standortfreigabe</h2></div>
      ${renderOwnLocationSwitch()}
    </div>
    <div class="legal-note"><b>Datenschutz:</b> Ohne aktive Freigabe wird kein Standort erfasst oder geteilt. Du siehst und änderst hier nur deine eigene Freigabe – nicht die der anderen Familienmitglieder.</div>`;
}

function renderOwnLocationSwitch() {
  const me = ui.loggedInMemberId;
  const s = statusById(me);
  const m = memberById(me);
  if (!s) return `<div class="empty-state">Bitte zuerst anmelden.</div>`;
  return `
    <div class="switch-row">
      <div><div class="switch-label">${m.avatar} ${escapeHtml(m.name)} – zu Hause / unterwegs</div><div class="switch-sub">${s.unterwegs ? "unterwegs" : "zu Hause"}</div></div>
      <button class="switch${s.unterwegs ? " on" : ""}" data-action="toggle-unterwegs" data-who="${me}"><div class="knob"></div></button>
    </div>
    <div class="switch-row">
      <div><div class="switch-label">Standort teilen</div><div class="switch-sub">jederzeit an-/ausschaltbar, Standard: aus</div></div>
      <button class="switch${s.shareLocation ? " on" : ""}" data-action="toggle-share-location" data-who="${me}"><div class="knob"></div></button>
    </div>`;
}

function renderChatTab() {
  const me = ui.loggedInMemberId || state.members[0].id;
  const chat = sortNewestFirst(state.chat);
  const { visible, hidden } = splitVisible(chat, VISIBLE_COUNT);
  const shown = ui.showAllChat ? chat : visible;

  const bubbles = shown.map((msg) => {
    const m = memberById(msg.who);
    const own = msg.who === me;
    return `<div class="bubble-row${msg.id === lastAddedId ? " just-added" : ""}" style="display:flex;flex-direction:column;align-items:${own ? "flex-end" : "flex-start"};">
      <div class="bubble${own ? " own" : ""}">
        <div class="bubble-meta">${m.avatar} ${escapeHtml(m.name)}</div>
        <div>${escapeHtml(msg.text)}</div>
        <div class="bubble-actions">
          <button class="reaction-btn" data-action="react-chat" data-id="${msg.id}">💛 ${msg.reactions || ""}</button>
          <button class="reaction-btn pill-danger" data-action="delete-chat" data-id="${msg.id}">✕</button>
        </div>
      </div>
    </div>`;
  }).join("") || `<div class="empty-state"><span class="empty-emoji">💬</span>Noch keine Nachricht – schreibt euch was Liebes.</div>`;

  return `
    <div class="section-head"><h2 class="section-title" style="color:var(--c3);">Familien-Chat</h2></div>
    <div class="floating-field" style="margin-bottom:14px;">
      <input id="new-chat-input" placeholder="Nachricht schreiben…" />
      <button class="send icon-btn" data-action="send-chat">➤</button>
    </div>
    ${bubbles}
    ${!ui.showAllChat && hidden.length > 0 ? `<button class="stack-pile" data-action="expand-chat">🗂 +${hidden.length} ältere Nachrichten</button>` : ""}
    <div class="legal-note">Nachrichten bleiben lokal auf diesem Gerät, bis der Geräte-Sync aktiv ist. Du schreibst als ${escapeHtml(memberById(me).name)}.</div>`;
}

function renderHinweiseTab() {
  const syncLabel = ui.syncStatus === "connected" ? "✓ Verbunden" : ui.syncStatus === "connecting" ? "Verbinde…" : ui.syncStatus === "error" ? "Fehler" : "Nicht eingerichtet";
  const notifSupported = "Notification" in window;
  const notifSub = !notifSupported ? "vom Browser nicht unterstützt"
    : Notification.permission === "denied" ? "in den iPhone-Einstellungen blockiert"
    : ui.notificationsEnabled ? "an – bei neuen Aufgaben, Terminen & Chats"
    : "aus – zum Aktivieren antippen";
  return `
    <div class="section-head"><h2 class="section-title" style="color:var(--c7);">Hinweise</h2></div>

    <div class="section">
      <div class="section-head"><h2 class="section-title" style="font-size:15px;color:var(--c7);">Familie & Gerät</h2></div>
      <button class="switch-row" style="width:100%;text-align:left;" data-action="show-code">
        <div><div class="switch-label">Familien-Code</div><div class="switch-sub">antippen zum Anzeigen</div></div>
        <span class="chip" style="background:var(--tint);color:var(--ink-soft);box-shadow:none;">${ui.familyCode ?? "…"}</span>
      </button>
      <button class="switch-row" style="width:100%;text-align:left;" data-action="logout">
        <div><div class="switch-label">Abmelden</div><div class="switch-sub">auf diesem Gerät ausloggen</div></div>
        <span style="font-size:18px;">🚪</span>
      </button>
    </div>

    <div class="section">
      <div class="section-head"><h2 class="section-title" style="font-size:15px;color:var(--c7);">Daten & Sync</h2></div>
      <button class="switch-row" style="width:100%;text-align:left;" data-action="download-backup">
        <div><div class="switch-label">Backup sichern</div><div class="switch-sub">lädt eine Datei aufs Handy</div></div>
        <span style="font-size:18px;">⬇️</span>
      </button>
      <button class="switch-row" style="width:100%;text-align:left;" data-action="trigger-restore">
        <div><div class="switch-label">Backup laden</div><div class="switch-sub">spielt eine gesicherte Datei ein</div></div>
        <span style="font-size:18px;">⬆️</span>
      </button>
      <button class="switch-row" style="width:100%;text-align:left;" data-action="show-sync">
        <div><div class="switch-label">Cloud-Sync</div><div class="switch-sub">${syncLabel}</div></div>
        <span style="font-size:18px;">☁️</span>
      </button>
      <input type="file" id="restore-file-input" accept="application/json" style="display:none;" />
    </div>

    <div class="section">
      <div class="section-head"><h2 class="section-title" style="font-size:15px;color:var(--c7);">App</h2></div>
      <button class="switch-row" style="width:100%;text-align:left;" data-action="show-install">
        <div><div class="switch-label">Installieren</div><div class="switch-sub">als App aufs Handy</div></div>
        <span style="font-size:18px;">📲</span>
      </button>
      <div class="switch-row">
        <div><div class="switch-label">Benachrichtigungen</div><div class="switch-sub">${notifSub}</div></div>
        <button class="switch${ui.notificationsEnabled ? " on" : ""}" data-action="toggle-notifications"><div class="knob"></div></button>
      </div>
    </div>

    <div class="section">
      <div class="section-head"><h2 class="section-title" style="font-size:15px;color:var(--c7);">Rechtliches</h2></div>
      <a class="switch-row" style="width:100%;text-align:left;text-decoration:none;" href="impressum.html">
        <div><div class="switch-label">Impressum</div></div>
        <span style="font-size:18px;">📄</span>
      </a>
      <a class="switch-row" style="width:100%;text-align:left;text-decoration:none;" href="datenschutz.html">
        <div><div class="switch-label">Datenschutz</div></div>
        <span style="font-size:18px;">🔒</span>
      </a>
    </div>`;
}

function renderSettingsModal(justOpened) {
  if (!ui.showSettingsModal) return "";
  const rows = state.members.map((m) => `
    <div style="margin-bottom:18px;">
      <input id="member-name-${m.id}" class="edit-row-input" style="width:100%;margin-bottom:8px;font-weight:700;" value="${escapeHtml(m.name)}" />
      <div style="display:flex;gap:6px;flex-wrap:wrap;">
        ${AVATAR_CHOICES.map((a) => `<button class="avatar-pick-btn${m.avatar === a ? " selected" : ""}" data-action="update-member-avatar" data-id="${m.id}" data-avatar="${a}">${a}</button>`).join("")}
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px;">
        ${MEMBER_COLOR_CHOICES.map((c) => `<button class="avatar-color-btn${m.color === c ? " selected" : ""}" style="background:${c}" data-action="update-member-color" data-id="${m.id}" data-color="${c}"></button>`).join("")}
      </div>
    </div>`).join("");

  const selfSection = ui.settingsMandatory ? `
    <div style="margin:16px 0;">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.1em;opacity:0.6;margin-bottom:8px;">Wer bist du?</div>
      ${state.members.map((m) => `<button class="self-pick-btn${ui.settingsSelf === m.id ? " selected" : ""}" data-action="pick-self" data-id="${m.id}">${m.avatar} <span>${escapeHtml(m.name)}</span></button>`).join("")}
    </div>` : "";

  const canFinish = !ui.settingsMandatory || !!ui.settingsSelf;
  const finishAction = ui.settingsMandatory ? "finish-mandatory-setup" : "close-settings";

  return `
    <div class="modal-backdrop"${ui.settingsMandatory ? "" : ' data-action="close-settings-backdrop"'}>
      <div class="modal-card${justOpened ? " modal-enter" : ""}">
        <div style="display:flex;justify-content:space-between;margin-bottom:16px;">
          <h3 style="margin:0;">Namen & Avatare</h3>
          ${ui.settingsMandatory ? "" : '<button class="close-btn" data-action="close-settings">✕</button>'}
        </div>
        ${ui.settingsMandatory ? `<p style="font-size:13px;line-height:1.6;opacity:0.75;margin-top:0;">Tragt eure echten Namen ein und wählt jeweils einen Avatar. Wähle danach unten, wer von euch du bist.</p>` : ""}
        ${rows}
        ${selfSection}
        <button class="btn primary full"${canFinish ? "" : " disabled style=\"opacity:0.45;\""} data-action="${canFinish ? finishAction : "noop"}">Fertig</button>
      </div>
    </div>`;
}

function renderInstallModal(justOpened) {
  if (!ui.showInstallModal) return "";
  return `
    <div class="modal-backdrop">
      <div class="modal-card${justOpened ? " modal-enter" : ""}">
        <div style="display:flex;justify-content:space-between;">
          <h3 style="margin:0;">So installierst du FamLumi</h3>
          <button class="close-btn" data-action="close-install">✕</button>
        </div>
        <div style="margin-top:16px;display:flex;flex-direction:column;gap:12px;font-size:14px;line-height:1.6;">
          <div style="background:#F8F4EE;border-radius:14px;padding:12px;"><b>iPhone · Safari</b><br/>Teilen-Button unten → „Zum Home-Bildschirm".</div>
          <div style="background:#F8F4EE;border-radius:14px;padding:12px;"><b>Android · Chrome</b><br/>Menü (⋮) → „App installieren".</div>
        </div>
        <p style="font-size:12px;line-height:1.6;opacity:0.6;margin-top:16px;">FamLumi – 0 € Familien-App, läuft komplett lokal im Browser. Kein Server speichert Daten, kein Tracking, keine Werbung.</p>
        <button class="btn primary full" style="margin-top:8px;" data-action="close-install">Verstanden</button>
      </div>
    </div>`;
}

function renderOnboarding(justOpened) {
  if (!ui.showOnboarding) return "";
  return `
    <div class="onboarding-backdrop">
      <div class="onboarding-card${justOpened ? " modal-enter" : ""}">
        <div class="onboarding-logo">FamLumi</div>
        <p style="text-align:center;font-size:13px;opacity:0.6;margin:0 0 6px;">für uns, mit Liebe gemacht</p>
        <div class="onboarding-step">
          <div class="num">1</div>
          <p><b>Heute</b> ist eure Startseite: Satz des Tages, Aufgaben zum Abhaken (das kann jeder aus der Familie, ganz egal wer sie angelegt hat), und wie's allen gerade geht.</p>
        </div>
        <div class="onboarding-step">
          <div class="num">2</div>
          <p><b>Aufgaben, Kalender, Karte, Chat</b> unten in der Leiste – für alles gibt's ein eigenes Feld zum Hinzufügen, alles ist bearbeit- und löschbar. Unter <b>Hinweise</b> findest du Familien-Code, Backup, Cloud-Sync und Installieren.</p>
        </div>
        <div class="onboarding-step">
          <div class="num">3</div>
          <p>Gleich geht's weiter mit euren <b>echten Namen</b> und wer von euch du bist.</p>
        </div>
        <div class="onboarding-step">
          <div class="num">4</div>
          <p>Alles bleibt <b>lokal auf dem Gerät</b> – für den Austausch zwischen euren Handys gibt's unten "Backup" und optional "Cloud-Sync".</p>
        </div>
        <button class="btn primary full" style="margin-top:20px;" data-action="dismiss-onboarding">Los geht's</button>
      </div>
    </div>`;
}

function renderReloginModal(justOpened) {
  if (!ui.showReloginModal) return "";
  const rows = state.members.map((m) => `<button class="self-pick-btn" data-action="relogin" data-id="${m.id}">${m.avatar} <span>${escapeHtml(m.name)}</span></button>`).join("");
  return `
    <div class="modal-backdrop">
      <div class="modal-card${justOpened ? " modal-enter" : ""}">
        <h3 style="margin:0 0 10px;">Wieder anmelden</h3>
        <p style="font-size:13px;line-height:1.6;opacity:0.75;">Euer Familien-Code: <b>${ui.familyCode}</b>. Wähle, wer von euch du bist, um wieder online zu gehen.</p>
        ${rows}
      </div>
    </div>`;
}

function renderSyncModal(justOpened) {
  if (!ui.showSyncModal) return "";
  const hasConfig = !!localStorage.getItem(FIREBASE_CONFIG_KEY);
  const badgeClass = ui.syncStatus === "connected" ? "connected" : ui.syncStatus === "error" ? "error" : "off";
  const badgeText = ui.syncStatus === "connected" ? "✓ Verbunden" : ui.syncStatus === "connecting" ? "Verbinde…" : ui.syncStatus === "error" ? "Fehler beim Verbinden" : "Nicht eingerichtet";
  return `
    <div class="modal-backdrop">
      <div class="modal-card${justOpened ? " modal-enter" : ""}">
        <div style="display:flex;justify-content:space-between;">
          <h3 style="margin:0;">Cloud-Sync</h3>
          <button class="close-btn" data-action="close-sync">✕</button>
        </div>
        <div class="sync-status-badge ${badgeClass}">${badgeText}</div>
        <p style="font-size:14px;line-height:1.6;">Damit sich Aufgaben, Kalender & Co. automatisch zwischen den Handys der Familie abgleichen, braucht es ein <b>eigenes, kostenloses</b> Firebase-Projekt (Google-Konto reicht, dauerhaft gratis).</p>
        <ol class="sync-steps">
          <li>Auf <b>console.firebase.google.com</b> ein neues Projekt anlegen</li>
          <li>Dort "Web-App hinzufügen" (das &lt;/&gt;-Symbol)</li>
          <li>"Realtime Database" aktivieren (Testmodus reicht)</li>
          <li>Den angezeigten <b>firebaseConfig</b>-Codeblock kopieren</li>
          <li>Hier unten einfügen und speichern</li>
        </ol>
        <textarea id="sync-config-input" class="sync-textarea" placeholder='const firebaseConfig = { apiKey: "...", databaseURL: "...", ... }'></textarea>
        <div style="display:flex;gap:8px;margin-top:12px;">
          <button class="btn primary" data-action="save-sync-config">Speichern & verbinden</button>
          ${hasConfig ? `<button class="btn" data-action="disconnect-sync">Trennen</button>` : ""}
        </div>
        <p style="font-size:12px;opacity:0.5;margin-top:12px;">Ohne diese Einrichtung funktioniert die App genauso weiter wie bisher – nur eben ohne automatischen Geräte-Abgleich.</p>
      </div>
    </div>`;
}

function renderTabContent() {
  switch (ui.activeTab) {
    case "heute": return renderHeuteTab();
    case "aufgaben": return renderAufgabenTab();
    case "kalender": return renderKalenderTab();
    case "karte": return renderKarteTab();
    case "chat": return renderChatTab();
    case "hinweise": return renderHinweiseTab();
    default: return "";
  }
}

let leafletMap = null;
let leafletMapExpanded = null;
// Merkt sich, welche Modale beim letzten render() bereits sichtbar waren -
// so spielt die "Erscheinen"-Animation nur beim tatsächlichen Öffnen, nicht
// bei jedem Re-Render durch andere Aktionen.
let prevOpenModals = new Set();
// Wird von toggleChecked/thank für genau einen Render-Durchlauf gesetzt,
// damit nur der gerade angetippte Haken die Pop-Animation bekommt.
let lastToggledTaskId = null;
let calendarSlideDir = null; // "left"/"right" für einen einzelnen Render-Durchlauf
let lastAddedId = null; // sorgt dafür, dass nur das neu hinzugefügte Element einfliegt

function ensureLeaflet(cb) {
  if (window.L) { cb(); return; }
  if (!document.getElementById("leaflet-css")) {
    const link = document.createElement("link");
    link.id = "leaflet-css"; link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
  }
  if (document.getElementById("leaflet-js")) {
    // Skript wird schon geladen (z.B. von der Karte) - auf onload warten statt doppelt einzufügen.
    document.getElementById("leaflet-js").addEventListener("load", cb, { once: true });
    return;
  }
  const script = document.createElement("script");
  script.id = "leaflet-js";
  script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
  script.onload = cb;
  script.onerror = () => { window.dispatchEvent(new Event("leaflet-load-error")); };
  document.body.appendChild(script);
}

// Baut eine einfache Standort-Karte (Kachel + Marker) in den übergebenen Container.
function buildLocationMap(container, zoom) {
  container.innerHTML = "";
  const center = ui.myLocation ? [ui.myLocation.lat, ui.myLocation.lon] : [51.16, 10.45]; // Fallback: Mitte Deutschlands, bis der eigene Standort bekannt ist
  const map = window.L.map(container, { zoomControl: false }).setView(center, ui.myLocation ? zoom : 6);
  window.L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "&copy; OpenStreetMap-Mitwirkende" }).addTo(map);
  if (ui.myLocation) window.L.marker(center).addTo(map);
  return map;
}

function initMapIfNeeded() {
  if (ui.activeTab !== "karte") return;
  const container = document.getElementById("leaflet-map");
  if (!container) return;
  const onError = () => {
    const fb = document.getElementById("map-fallback");
    if (fb) fb.textContent = "🗺️ Karte konnte nicht geladen werden (kein Internet?)";
  };
  window.addEventListener("leaflet-load-error", onError, { once: true });
  ensureLeaflet(() => { if (window.L) leafletMap = buildLocationMap(container, 12); });
}

function initExpandedMapIfNeeded() {
  const container = document.getElementById("leaflet-map-expanded");
  if (!container) return;
  const onError = () => {
    const fb = document.getElementById("map-expanded-fallback");
    if (fb) fb.textContent = "Karte konnte nicht geladen werden (kein Internet?)";
  };
  window.addEventListener("leaflet-load-error", onError, { once: true });
  ensureLeaflet(() => { if (window.L) leafletMapExpanded = buildLocationMap(container, 14); });
}

function renderMapModal(justOpened) {
  if (!ui.mapExpanded) return "";
  return `
    <div class="map-modal-backdrop">
      <button class="map-modal-close" data-action="close-map-modal">✕</button>
      <div class="map-modal-body${justOpened ? " modal-enter" : ""}">
        <div id="leaflet-map-expanded" style="width:100%;height:100%;"><div id="map-expanded-fallback" class="skeleton" style="height:100%;display:grid;place-items:center;text-align:center;padding:1rem;font-size:13px;color:var(--ink-soft);">🗺️ Karte lädt …</div></div>
      </div>
    </div>`;
}

function render() {
  const root = document.getElementById("root");
  // Modal-Öffnen-Animationen nur beim tatsächlichen Öffnen abspielen, nicht
  // bei jedem Re-Render durch andere Aktionen (siehe prevOpenModals).
  const currentModals = new Set();
  if (ui.showSettingsModal) currentModals.add("settings");
  if (ui.showInstallModal) currentModals.add("install");
  if (ui.showSyncModal) currentModals.add("sync");
  if (ui.showReloginModal) currentModals.add("relogin");
  if (ui.showOnboarding) currentModals.add("onboarding");
  if (ui.mapExpanded) currentModals.add("map");
  const justOpened = (key) => currentModals.has(key) && !prevOpenModals.has(key);

  try {
    root.innerHTML = `
      <div class="app">
        ${renderHeader()}
        <div class="container">
          ${renderTabContent()}
        </div>
        ${renderNav()}
      </div>
      ${renderSettingsModal(justOpened("settings"))}
      ${renderInstallModal(justOpened("install"))}
      ${renderSyncModal(justOpened("sync"))}
      ${renderReloginModal(justOpened("relogin"))}
      ${renderOnboarding(justOpened("onboarding"))}
      ${renderMapModal(justOpened("map"))}
    `;
    prevOpenModals = currentModals;
  } catch (e) {
    // Ein Fehler in einem einzelnen Tab soll nie die ganze App unbenutzbar machen - lieber auf "Heute" zurückfallen
    // als eine leere/eingefrorene Seite zu zeigen.
    console.error("Render-Fehler, falle auf Heute zurück:", e);
    if (ui.activeTab !== "heute") { ui.activeTab = "heute"; render(); return; }
  }
  initMapIfNeeded();
  if (ui.mapExpanded) initExpandedMapIfNeeded();
  const editInput = document.getElementById("edit-inline-input");
  if (editInput) { editInput.focus(); editInput.setSelectionRange(editInput.value.length, editInput.value.length); }
}

// ---------- Event-Delegation ----------

document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const action = el.dataset.action;
  const id = el.dataset.id;

  switch (action) {
    case "noop": break;
    case "add-task": { const inp = document.getElementById("new-task-input"); actions.addTask(inp.value); } break;
    case "toggle-checked": actions.toggleChecked(id, el); break;
    case "thank": actions.thank(id, el); break;
    case "start-edit-task": actions.startEditTask(id); break;
    case "save-edit-task": actions.saveEditTask(id); break;
    case "delete-task": actions.deleteTask(id); break;
    case "expand-tasks": actions.expandTasks(); break;
    case "add-event": {
      const titleInp = document.getElementById("new-event-title-input");
      const fromInp = document.getElementById("new-event-time-from-input");
      const toInp = document.getElementById("new-event-time-to-input");
      actions.addEvent(titleInp.value, ui.calendarSelectedDate || todayDateStr(), fromInp.value, toInp.value);
    } break;
    case "start-edit-event": actions.startEditEvent(id); break;
    case "save-edit-event": actions.saveEditEvent(id); break;
    case "delete-event": actions.deleteEvent(id); break;
    case "cal-prev-month": actions.calPrevMonth(); break;
    case "cal-next-month": actions.calNextMonth(); break;
    case "cal-select-day": actions.calSelectDay(el.dataset.date); break;
    case "toggle-unterwegs": actions.toggleUnterwegs(el.dataset.who); break;
    case "toggle-share-location": actions.toggleShareLocation(el.dataset.who); break;
    case "send-chat": { const inp = document.getElementById("new-chat-input"); actions.sendChat(inp.value); } break;
    case "react-chat": actions.reactChat(id); break;
    case "delete-chat": actions.deleteChat(id); break;
    case "expand-chat": actions.expandChat(); break;
    case "goto-tab": actions.gotoTab(el.dataset.tab); break;
    case "open-activity-item": actions.openActivityItem(el.dataset.tab, el.dataset.itemId); break;
    case "reset-seen-activity": actions.resetSeenActivity(); break;
    case "show-settings": actions.showSettings(); break;
    case "close-settings": actions.closeSettings(); break;
    case "finish-mandatory-setup": actions.finishMandatorySetup(); break;
    case "close-settings-backdrop": if (e.target === el) actions.closeSettings(); break;
    case "update-member-avatar": actions.updateMemberAvatar(id, el.dataset.avatar); break;
    case "update-member-color": actions.updateMemberColor(id, el.dataset.color); break;
    case "pick-self": actions.pickSelf(id); break;
    case "show-install": actions.showInstall(); break;
    case "close-install": actions.closeInstall(); break;
    case "toggle-sound": actions.toggleSound(); break;
    case "toggle-notifications": actions.toggleNotifications(); break;
    case "expand-map": actions.expandMap(); break;
    case "close-map-modal": actions.closeMapModal(); break;
    case "toggle-theme": actions.toggleTheme(); break;
    case "dismiss-onboarding": actions.dismissOnboarding(); break;
    case "download-backup": actions.downloadBackup(); break;
    case "trigger-restore": document.getElementById("restore-file-input").click(); break;
    case "show-sync": actions.showSync(); break;
    case "close-sync": actions.closeSync(); break;
    case "save-sync-config": actions.saveSyncConfig(); break;
    case "disconnect-sync": actions.disconnectSync(); break;
    case "logout": actions.logout(); break;
    case "relogin": actions.relogin(id); break;
    case "show-code": alert("Euer Familien-Code: " + (ui.familyCode || "…")); break;
  }
});

document.addEventListener("change", (e) => {
  if (e.target && e.target.id === "restore-file-input") {
    actions.restoreBackupFromFile(e.target.files[0]);
    e.target.value = "";
    return;
  }
});

// Enter-Taste in den "Neu hinzufügen"-Feldern soll wie der Senden-Button wirken.
document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const idToAction = {
    "new-task-input": () => actions.addTask(e.target.value),
    "new-event-title-input": () => document.querySelector('[data-action="add-event"]').click(),
    "new-chat-input": () => actions.sendChat(e.target.value),
  };
  if (idToAction[e.target.id]) idToAction[e.target.id]();
});

// ---------- Cloud-Sync-Engine (Firebase Realtime Database, optional) ----------

let firebaseApp = null;
let firebaseDb = null;
let pushTimer = null;
let lastPushedAt = null;

function parseFirebaseConfigInput(text) {
  try {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return null;
    const obj = new Function("return (" + match[0] + ")")();
    if (obj && obj.apiKey && obj.databaseURL) return obj;
    return null;
  } catch (e) { return null; }
}

function loadFirebaseScripts(cb) {
  if (window.firebase && window.firebase.database) { cb(); return; }
  const s1 = document.createElement("script");
  s1.src = "https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js";
  s1.onload = () => {
    const s2 = document.createElement("script");
    s2.src = "https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js";
    s2.onload = cb;
    s2.onerror = () => { ui.syncStatus = "error"; render(); };
    document.body.appendChild(s2);
  };
  s1.onerror = () => { ui.syncStatus = "error"; render(); };
  document.body.appendChild(s1);
}

function initFirebaseSync() {
  let config;
  try {
    const raw = localStorage.getItem(FIREBASE_CONFIG_KEY);
    config = raw ? JSON.parse(raw) : null;
  } catch (e) { config = null; }
  if (!config || !ui.familyCode) return;

  loadFirebaseScripts(() => {
    try {
      firebaseApp = window.firebase.initializeApp(config);
      firebaseDb = window.firebase.database();
      firebaseDb.ref("families/" + ui.familyCode).on("value", (snapshot) => {
        const remote = snapshot.val();
        ui.syncStatus = "connected";
        if (!remote || !remote.lastModified) { render(); return; }
        if (remote.lastModified === lastPushedAt) { render(); return; }
        if (!state.lastModified || remote.lastModified > state.lastModified) {
          notifyNewItems(state, remote);
          state = Object.assign(defaultData(), remote);
          render();
        }
      }, () => { ui.syncStatus = "error"; render(); });
      pushToFirebase();
    } catch (e) {
      ui.syncStatus = "error"; render();
    }
  });
}

function pushToFirebase() {
  if (!firebaseDb || !ui.familyCode) return;
  clearTimeout(pushTimer);
  pushTimer = setTimeout(() => {
    state.lastModified = Date.now();
    lastPushedAt = state.lastModified;
    firebaseDb.ref("families/" + ui.familyCode).set(state).catch(() => { ui.syncStatus = "error"; render(); });
  }, 700);
}

function showLocalNotification(title, body) {
  const opts = { body, icon: "./icon-192.png", badge: "./icon-192.png", tag: "famlumi-" + Date.now() };
  if (navigator.serviceWorker && navigator.serviceWorker.ready) {
    navigator.serviceWorker.ready.then((reg) => reg.showNotification(title, opts)).catch(() => {
      try { new Notification(title, opts); } catch (e) {}
    });
  } else {
    try { new Notification(title, opts); } catch (e) {}
  }
}

// Vergleicht alten und neu vom Sync eingetroffenen Stand und benachrichtigt
// nur über wirklich neue Einträge anderer Familienmitglieder (nicht die eigenen,
// nicht beim allerersten Verbinden mit bereits bestehenden Daten).
function notifyNewItems(oldState, newState) {
  if (!ui.notificationsEnabled || !("Notification" in window) || Notification.permission !== "granted") return;
  if (!oldState.lastModified) return; // allererster Sync: keine Flut alter Einträge melden
  const oldIds = new Set([
    ...(oldState.tasks || []).map((t) => t.id),
    ...(oldState.events || []).map((e) => e.id),
    ...(oldState.chat || []).map((c) => c.id),
  ]);
  const KIND_LABEL = { aufgabe: "Neue Aufgabe", termin: "Neuer Termin", chat: "Neue Chat-Nachricht" };
  const newItems = [];
  (newState.tasks || []).forEach((t) => { if (!oldIds.has(t.id) && t.who !== ui.loggedInMemberId) newItems.push({ kind: "aufgabe", who: t.who, text: t.text }); });
  (newState.events || []).forEach((ev) => { if (!oldIds.has(ev.id) && ev.who !== ui.loggedInMemberId) newItems.push({ kind: "termin", who: ev.who, text: ev.title }); });
  (newState.chat || []).forEach((c) => { if (!oldIds.has(c.id) && c.who !== ui.loggedInMemberId) newItems.push({ kind: "chat", who: c.who, text: c.text }); });
  newItems.slice(0, 3).forEach((item) => {
    const m = memberById(item.who);
    showLocalNotification(`${KIND_LABEL[item.kind]} · FamLumi`, `${m ? m.name + ": " : ""}${item.text}`);
  });
}

function init() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === "dark") {
    ui.theme = "dark";
    document.documentElement.setAttribute("data-theme", "dark");
  }
  ui.seenActivityIds = loadSeenActivityIds();
  ui.notificationsEnabled = localStorage.getItem(NOTIF_ENABLED_KEY) === "1" && "Notification" in window && Notification.permission === "granted";

  const savedCode = localStorage.getItem(CODE_KEY);
  if (savedCode) {
    ui.familyCode = savedCode;
  } else {
    ui.familyCode = generateFamilyCode();
    localStorage.setItem(CODE_KEY, ui.familyCode);
  }

  const saved = loadSavedData();
  if (saved) {
    state = Object.assign(defaultData(), saved);
    if (!state.soundOn && state.soundOn !== false) state.soundOn = true;
  }
  if (state.soundOn === undefined) state.soundOn = true;

  const loggedIn = localStorage.getItem(LOGIN_KEY);
  if (loggedIn && state.members.some((m) => m.id === loggedIn)) {
    ui.loggedInMemberId = loggedIn;
    const s = statusById(loggedIn);
    if (s) { s.online = true; saveData(); }
  }

  // Onboarding + verpflichtendes Setup nur beim allerersten Start
  if (!localStorage.getItem(ONBOARDING_KEY)) {
    ui.showOnboarding = true;
  } else if (!ui.loggedInMemberId) {
    ui.showSettingsModal = true;
    ui.settingsMandatory = true;
  }

  if (localStorage.getItem(FIREBASE_CONFIG_KEY)) {
    ui.syncStatus = "connecting";
  }

  render();
  loadOwnLocation();
  initFirebaseSync();
}

init();

  