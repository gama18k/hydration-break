const i18n = {
  "pt-BR": {
    appName: "Pausa da Hidrata\u00e7\u00e3o",
    navHome: "In\u00edcio",
    navStats: "Estat\u00edsticas",
    navHistory: "Hist\u00f3rico",
    navTips: "Dicas",
    navSettings: "Configura\u00e7\u00f5es",
    heroTitle: "Pausa da Hidrata\u00e7\u00e3o",
    technicalBreak: "Intervalo t\u00e9cnico",
    cupMood: "Modo Copa",
    hydrationCup: "Copa da hidrata\u00e7\u00e3o",
    subtitle: "Um lembrete com clima de jogo para voc\u00ea beber \u00e1gua no tempo certo e manter o foco!",
    you: "Voc\u00ea",
    water: "\u00c1gua",
    readyStatus: "Prepare-se! A pausa j\u00e1 vai come\u00e7ar.",
    runningStatus: "Bola rolando. Pr\u00f3xima pausa em {time}.",
    pausedStatus: "Partida pausada.",
    alertStatus: "Pausa hidrata\u00e7\u00e3o em campo!",
    intervalLabel: "Intervalo a cada",
    minutes: "minutos",
    minutesShort: "min",
    language: "Idioma",
    sound: "Som",
    systemNotification: "Notifica\u00e7\u00f5es",
    start: "Iniciar",
    restart: "Reiniciar",
    pause: "Pausar",
    resume: "Retomar",
    reset: "Resetar",
    today: "Hoje",
    cups: "ml confirmados",
    dailyProgress: "Progresso de Hidrata\u00e7\u00e3o",
    dailyGoal: "Meta di\u00e1ria",
    alreadyDrank: "J\u00e1 tomou",
    remaining: "Faltam",
    servingAmount: "Por \u00e1gua",
    goalProgress: "{consumed} de {goal} confirmados",
    goalComplete: "Meta batida: {consumed} confirmados!",
    goalPercent: "{percentage}% da meta di\u00e1ria conclu\u00edda",
    history: "Hist\u00f3rico",
    recentHistory: "Hist\u00f3rico Recente",
    viewFullHistory: "Ver hist\u00f3rico completo",
    emptyHistory: "Sem registros ainda",
    quote: "Hidrata\u00e7\u00e3o \u00e9 performance. Beba \u00e1gua, jogue melhor, viva mais!",
    modalTitle: "Pausa hidrata\u00e7\u00e3o!",
    modalMessage: "Hora de beber \u00e1gua e voltar para o segundo tempo.",
    drank: "Bebi \u00e1gua",
    snooze: "Adiar 5 min",
    notificationTitle: "Pausa hidrata\u00e7\u00e3o!",
    notificationBody: "Intervalo t\u00e9cnico: hora de beber \u00e1gua.",
    permissionDenied: "Notifica\u00e7\u00f5es bloqueadas no navegador",
    notificationsUnavailable: "Notifica\u00e7\u00f5es indispon\u00edveis nesta aba ou navegador",
    nextBreakAt: "Pr\u00f3xima pausa \u00e0s {time}"
  },
  en: {
    appName: "Hydration Break",
    navHome: "Home",
    navStats: "Stats",
    navHistory: "History",
    navTips: "Tips",
    navSettings: "Settings",
    heroTitle: "Hydration Break",
    technicalBreak: "Technical break",
    cupMood: "Cup mode",
    hydrationCup: "Hydration cup",
    subtitle: "A match-day reminder to drink water at the right time and keep your focus!",
    you: "You",
    water: "Water",
    readyStatus: "Get ready! The break is about to start.",
    runningStatus: "Match running. Next break in {time}.",
    pausedStatus: "Match paused.",
    alertStatus: "Hydration break on the field!",
    intervalLabel: "Interval every",
    minutes: "minutes",
    minutesShort: "min",
    language: "Language",
    sound: "Sound",
    systemNotification: "Notifications",
    start: "Start",
    restart: "Restart",
    pause: "Pause",
    resume: "Resume",
    reset: "Reset",
    today: "Today",
    cups: "ml confirmed",
    dailyProgress: "Daily Progress",
    dailyGoal: "Daily goal",
    alreadyDrank: "Already drank",
    remaining: "Remaining",
    servingAmount: "Per water",
    goalProgress: "{consumed} of {goal} confirmed",
    goalComplete: "Goal reached: {consumed} confirmed!",
    goalPercent: "{percentage}% of the daily goal complete",
    history: "History",
    recentHistory: "Recent History",
    viewFullHistory: "View full history",
    emptyHistory: "No records yet",
    quote: "Hydration is performance. Drink water, play better, live more!",
    modalTitle: "Hydration break!",
    modalMessage: "Time to drink water and get back for the second half.",
    drank: "I drank water",
    snooze: "Snooze 5 min",
    notificationTitle: "Hydration break!",
    notificationBody: "Technical break: time to drink water.",
    permissionDenied: "Notifications are blocked in the browser",
    notificationsUnavailable: "Notifications are unavailable in this tab or browser",
    nextBreakAt: "Next break at {time}"
  }
};

const storageKey = "pausa-hidratacao:v1";
const {
  clamp,
  formatClockTime,
  formatDate,
  formatMs,
  formatVolume,
  getGoalProgress,
  minutesToMs,
  normalizeState,
  resetTimer,
  scheduleNextTimer,
  startTimer,
  todayKey,
  togglePauseTimer
} = window.PausaHidratacaoUtils;
const defaultState = {
  locale: "pt-BR",
  intervalMinutes: 2,
  dailyGoalMl: 2000,
  servingMl: 250,
  soundEnabled: true,
  notificationsEnabled: false,
  isRunning: false,
  isPaused: false,
  nextAlertAt: null,
  remainingMs: null,
  history: {}
};

let state = loadState();
let tickId = null;
let audioContext = null;
let lastFocusedElement = null;
let notificationPermissionPending = false;
let statusOverride = null;

const nodes = {
  countdown: document.querySelector("#countdown"),
  statusText: document.querySelector("#statusText"),
  nextAlertText: document.querySelector("#nextAlertText"),
  intervalInput: document.querySelector("#intervalInput"),
  presetMinutes: document.querySelector("#presetMinutes"),
  soundToggle: document.querySelector("#soundToggle"),
  notificationToggle: document.querySelector("#notificationToggle"),
  localeSelect: document.querySelector("#localeSelect"),
  localeToggle: document.querySelector("#localeToggle"),
  startButton: document.querySelector("#startButton"),
  pauseButton: document.querySelector("#pauseButton"),
  resetButton: document.querySelector("#resetButton"),
  modal: document.querySelector("#hydrationModal"),
  drankButton: document.querySelector("#drankButton"),
  snoozeButton: document.querySelector("#snoozeButton"),
  todayCount: document.querySelector("#todayCount"),
  dailyGoalCount: document.querySelector("#dailyGoalCount"),
  dailyConsumedCount: document.querySelector("#dailyConsumedCount"),
  dailyRemainingCount: document.querySelector("#dailyRemainingCount"),
  dailyGoalInput: document.querySelector("#dailyGoalInput"),
  servingInput: document.querySelector("#servingInput"),
  goalProgressBar: document.querySelector("#goalProgressBar"),
  progressRing: document.querySelector("#progressRing"),
  goalPercentText: document.querySelector("#goalPercentText"),
  goalStatus: document.querySelector("#goalStatus"),
  historyList: document.querySelector("#historyList")
};

applyTranslations();
syncControls();
render();
startTicker();

nodes.intervalInput.addEventListener("focus", () => {
  nodes.intervalInput.select();
});

nodes.intervalInput.addEventListener("input", () => {
  const value = nodes.intervalInput.value.trim();
  if (!value) return;

  updateIntervalMinutes(Number(value), { syncInput: false });
});

nodes.intervalInput.addEventListener("change", () => {
  updateIntervalMinutes(Number(nodes.intervalInput.value || defaultState.intervalMinutes));
});

nodes.intervalInput.addEventListener("blur", () => {
  updateIntervalMinutes(Number(nodes.intervalInput.value || defaultState.intervalMinutes));
});

nodes.dailyGoalInput.addEventListener("focus", () => {
  nodes.dailyGoalInput.select();
});

nodes.dailyGoalInput.addEventListener("input", () => {
  const value = nodes.dailyGoalInput.value.trim();
  if (!value) return;

  updateDailyGoalMl(Number(value), { syncInput: false });
});

nodes.dailyGoalInput.addEventListener("change", () => {
  updateDailyGoalMl(Number(nodes.dailyGoalInput.value || defaultState.dailyGoalMl));
});

nodes.dailyGoalInput.addEventListener("blur", () => {
  updateDailyGoalMl(Number(nodes.dailyGoalInput.value || defaultState.dailyGoalMl));
});

nodes.servingInput.addEventListener("focus", () => {
  nodes.servingInput.select();
});

nodes.servingInput.addEventListener("input", () => {
  const value = nodes.servingInput.value.trim();
  if (!value) return;

  updateServingMl(Number(value), { syncInput: false });
});

nodes.servingInput.addEventListener("change", () => {
  updateServingMl(Number(nodes.servingInput.value || defaultState.servingMl));
});

nodes.servingInput.addEventListener("blur", () => {
  updateServingMl(Number(nodes.servingInput.value || defaultState.servingMl));
});

nodes.presetMinutes.addEventListener("click", (event) => {
  const button = event.target.closest("[data-minutes]");
  if (!button) return;

  updateIntervalMinutes(Number(button.dataset.minutes));
});

nodes.soundToggle.addEventListener("change", async () => {
  state.soundEnabled = nodes.soundToggle.checked;
  if (state.soundEnabled) {
    await unlockAudio();
    playChime(0.18);
  }
  saveState();
});

nodes.notificationToggle.addEventListener("change", async () => {
  if (!nodes.notificationToggle.checked) {
    state.notificationsEnabled = false;
    saveState();
    render();
    return;
  }

  if (!canNotify()) {
    state.notificationsEnabled = false;
    nodes.notificationToggle.checked = false;
    setStatusOverride(t("notificationsUnavailable"));
    saveState();
    render();
    return;
  }

  notificationPermissionPending = true;
  syncControls();
  let allowed = false;
  try {
    allowed = await requestNotificationPermission();
  } finally {
    notificationPermissionPending = false;
  }
  state.notificationsEnabled = allowed;
  nodes.notificationToggle.checked = allowed;
  saveState();
  render();
});

nodes.localeSelect.addEventListener("change", () => {
  state.locale = nodes.localeSelect.value;
  saveState();
  applyTranslations();
  render();
});

nodes.localeToggle.addEventListener("click", () => {
  state.locale = state.locale === "pt-BR" ? "en" : "pt-BR";
  saveState();
  applyTranslations();
  render();
});

nodes.startButton.addEventListener("click", async () => {
  prepareAudio();
  state = startTimer(state, Number(nodes.intervalInput.value || defaultState.intervalMinutes));
  saveState();
  render();
});

nodes.pauseButton.addEventListener("click", () => {
  state = togglePauseTimer(state);
  saveState();
  render();
});

nodes.resetButton.addEventListener("click", () => {
  state = resetTimer(state);
  hideModal();
  saveState();
  render();
});

function prepareAudio() {
  if (!state.soundEnabled) return;

  unlockAudio().catch(() => {
    state.soundEnabled = false;
    saveState();
    syncControls();
  });
}

function updateIntervalMinutes(value, options = {}) {
  const { syncInput = true } = options;
  if (state.isRunning) {
    nodes.intervalInput.value = String(state.intervalMinutes);
    return;
  }

  const minutes = clamp(value, 1, 240);

  state.intervalMinutes = minutes;
  if (syncInput) {
    nodes.intervalInput.value = String(minutes);
  }

  saveState();
  render();
}

function updateDailyGoalMl(value, options = {}) {
  const { syncInput = true } = options;
  const dailyGoalMl = clamp(value, 250, 10000);

  state.dailyGoalMl = dailyGoalMl;
  if (syncInput) {
    nodes.dailyGoalInput.value = String(dailyGoalMl);
  }

  saveState();
  render();
}

function updateServingMl(value, options = {}) {
  const { syncInput = true } = options;
  const servingMl = clamp(value, 50, 2000);

  state.servingMl = servingMl;
  if (syncInput) {
    nodes.servingInput.value = String(servingMl);
  }

  saveState();
  render();
}

nodes.drankButton.addEventListener("click", confirmHydration);
nodes.snoozeButton.addEventListener("click", snoozeHydration);
nodes.modal.addEventListener("keydown", handleModalKeydown);

function confirmHydration() {
  addWaterForToday();
  scheduleNext(state.intervalMinutes);
  hideModal();
  saveState();
  render();
}

function snoozeHydration() {
  scheduleNext(5);
  hideModal();
  saveState();
  render();
}

document.addEventListener("visibilitychange", render);
window.addEventListener("focus", render);

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    return normalizeState(saved, defaultState, { allowedLocales: Object.keys(i18n) });
  } catch {
    return { ...defaultState };
  }
}

function saveState() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (error) {
    console.warn("Nao foi possivel salvar o estado da aplicacao.", error);
  }
}

function t(key, params = {}) {
  const dictionary = i18n[state.locale] || i18n["pt-BR"];
  let value = dictionary[key] || i18n["pt-BR"][key] || key;
  Object.entries(params).forEach(([name, replacement]) => {
    value = value.replace(`{${name}}`, replacement);
  });
  return value;
}

function applyTranslations() {
  document.documentElement.lang = state.locale;
  document.querySelectorAll("[data-i18n]").forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });
  document.title = t("appName");
}

function syncControls() {
  const intervalLocked = state.isRunning;

  if (document.activeElement !== nodes.intervalInput) {
    nodes.intervalInput.value = String(state.intervalMinutes);
  }
  if (document.activeElement !== nodes.dailyGoalInput) {
    nodes.dailyGoalInput.value = String(state.dailyGoalMl);
  }
  if (document.activeElement !== nodes.servingInput) {
    nodes.servingInput.value = String(state.servingMl);
  }
  nodes.soundToggle.checked = state.soundEnabled;
  const notificationsSupported = canNotify();
  nodes.notificationToggle.checked = notificationPermissionPending || (state.notificationsEnabled && notificationsSupported && Notification.permission === "granted");
  nodes.notificationToggle.disabled = notificationPermissionPending;
  nodes.notificationToggle.closest(".switch").classList.toggle("is-disabled", nodes.notificationToggle.disabled);
  nodes.localeSelect.value = state.locale;
  syncLanguageToggle();
  nodes.intervalInput.disabled = intervalLocked;
  nodes.presetMinutes.querySelectorAll("[data-minutes]").forEach((button) => {
    const isActive = Number(button.dataset.minutes) === state.intervalMinutes;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
    button.disabled = intervalLocked;
  });
}

function syncLanguageToggle() {
  if (!nodes.localeToggle) return;

  const isPortuguese = state.locale === "pt-BR";
  const label = isPortuguese ? "Idioma: Português" : "Language: English";
  nodes.localeToggle.querySelector("span").textContent = isPortuguese ? "🇧🇷" : "🇺🇸";
  nodes.localeToggle.classList.toggle("is-en", !isPortuguese);
  nodes.localeToggle.setAttribute("aria-label", label);
  nodes.localeToggle.setAttribute("title", label);
}

function render() {
  const remaining = getRemainingMs();

  if (state.isRunning && !state.isPaused && remaining <= 0) {
    triggerHydrationAlert();
    return;
  }

  nodes.countdown.textContent = formatMs(Math.max(0, remaining));
  nodes.pauseButton.disabled = !state.isRunning;
  nodes.pauseButton.textContent = state.isPaused ? t("resume") : t("pause");
  nodes.startButton.textContent = state.isRunning ? t("restart") : t("start");
  renderDailyGoal();
  nodes.statusText.textContent = getStatusText(remaining);
  renderNextAlert();
  renderHistory();
  syncControls();
}

function getRemainingMs() {
  if (!state.isRunning) return minutesToMs(state.intervalMinutes);
  if (state.isPaused) return state.remainingMs || 0;
  return Number(state.nextAlertAt || 0) - Date.now();
}

function getStatusText(remaining) {
  if (statusOverride && statusOverride.expiresAt > Date.now()) return statusOverride.message;
  statusOverride = null;
  if (!state.isRunning) return t("readyStatus");
  if (state.isPaused) return t("pausedStatus");
  return t("runningStatus", { time: formatMs(Math.max(0, remaining)) });
}

function setStatusOverride(message, durationMs = 4000) {
  statusOverride = {
    message,
    expiresAt: Date.now() + durationMs
  };
}

function renderNextAlert() {
  const shouldShowNextAlert = state.isRunning && !state.isPaused && state.nextAlertAt;
  nodes.nextAlertText.hidden = !shouldShowNextAlert;

  if (!shouldShowNextAlert) {
    nodes.nextAlertText.textContent = "";
    return;
  }

  nodes.nextAlertText.textContent = t("nextBreakAt", {
    time: formatClockTime(state.nextAlertAt, state.locale)
  });
}

function renderDailyGoal() {
  const progress = getGoalProgress(getTodayCount(), state.dailyGoalMl, state.servingMl);
  const consumed = formatVolume(progress.consumedMl, state.locale);
  const goal = formatVolume(progress.goalMl, state.locale);
  const remaining = formatVolume(Math.max(0, progress.goalMl - progress.consumedMl), state.locale);
  nodes.todayCount.textContent = consumed;
  nodes.dailyGoalCount.textContent = goal;
  nodes.dailyConsumedCount.textContent = consumed;
  nodes.dailyRemainingCount.textContent = remaining;
  nodes.goalStatus.textContent = progress.isComplete
    ? t("goalComplete", { consumed })
    : t("goalProgress", { consumed, goal });
  nodes.goalProgressBar.style.width = `${progress.percentage}%`;
  if (nodes.progressRing) {
    nodes.progressRing.style.setProperty("--goal-progress", `${progress.percentage}%`);
  }
  if (nodes.goalPercentText) {
    nodes.goalPercentText.textContent = t("goalPercent", { percentage: progress.percentage });
  }
}

function triggerHydrationAlert() {
  state.isRunning = false;
  state.isPaused = false;
  state.nextAlertAt = null;
  state.remainingMs = null;
  saveState();
  nodes.statusText.textContent = t("alertStatus");
  nodes.countdown.textContent = "00:00";
  showModal();
  playChime();
  showSystemNotification();
  renderHistory();
}

function scheduleNext(minutes) {
  state = scheduleNextTimer(state, minutes);
}

function showModal() {
  lastFocusedElement = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  nodes.modal.hidden = false;
  nodes.drankButton.focus();
}

function hideModal() {
  nodes.modal.hidden = true;
  if (lastFocusedElement && document.contains(lastFocusedElement)) {
    lastFocusedElement.focus();
  }
  lastFocusedElement = null;
}

function handleModalKeydown(event) {
  if (event.key === "Escape") {
    event.preventDefault();
    snoozeHydration();
    return;
  }

  if (event.key !== "Tab") return;

  const focusableElements = getFocusableModalElements();
  if (!focusableElements.length) {
    event.preventDefault();
    nodes.modal.focus();
    return;
  }

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}

function getFocusableModalElements() {
  return Array.from(nodes.modal.querySelectorAll(
    "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
  )).filter((element) => !element.disabled && element.offsetParent !== null);
}

function addWaterForToday() {
  const key = todayKey();
  state.history[key] = (state.history[key] || 0) + 1;
}

function getTodayCount() {
  return state.history[todayKey()] || 0;
}

function renderHistory() {
  const entries = Object.entries(state.history)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 7);

  nodes.historyList.innerHTML = "";

  if (!entries.length) {
    const item = document.createElement("li");
    item.textContent = t("emptyHistory");
    nodes.historyList.appendChild(item);
    return;
  }

  entries.forEach(([date, count]) => {
    const item = document.createElement("li");
    const dateNode = document.createElement("span");
    const countNode = document.createElement("strong");
    dateNode.textContent = formatDate(date, state.locale);
    countNode.textContent = formatVolume(count * state.servingMl, state.locale);
    item.append(dateNode, countNode);
    nodes.historyList.appendChild(item);
  });
}

async function requestNotificationPermission() {
  if (!canNotify()) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") {
    setStatusOverride(t("permissionDenied"));
    return false;
  }
  const permission = await Notification.requestPermission();
  return permission === "granted";
}

function showSystemNotification() {
  if (!state.notificationsEnabled || !canNotify() || Notification.permission !== "granted") return;

  const notification = new Notification(t("notificationTitle"), {
    body: t("notificationBody"),
    tag: "pausa-hidratacao",
    requireInteraction: true
  });

  notification.onclick = () => {
    window.focus();
    showModal();
    notification.close();
  };
}

async function unlockAudio() {
  const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextConstructor) {
    throw new Error("AudioContext unavailable");
  }

  if (!audioContext) {
    audioContext = new AudioContextConstructor();
  }
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }
}

async function playChime(volume = 0.32) {
  if (!state.soundEnabled) return;

  try {
    await unlockAudio();
  } catch {
    return;
  }
  const now = audioContext.currentTime;
  const notes = [784, 988, 1175];

  notes.forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "triangle";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0, now + index * 0.16);
    gain.gain.linearRampToValueAtTime(volume, now + index * 0.16 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.16 + 0.22);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(now + index * 0.16);
    oscillator.stop(now + index * 0.16 + 0.24);
  });
}

function canNotify() {
  return "Notification" in window;
}

function startTicker() {
  window.clearInterval(tickId);
  tickId = window.setInterval(render, 500);
}
