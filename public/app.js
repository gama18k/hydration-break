(function bootHydrationBreak(root) {
  "use strict";

  const utils = root.PausaHidratacaoUtils || {};
  const { clamp, migrateLegacyDays } = utils;

  const STORAGE_KEY = "hb_state";
  const LEGACY_KEY = "pausa-hidratacao:v1";

  const T_STR = {
    pt: {
      brandTop: "Pausa", brandSub: "Hidratação", inicio: "Início", historico: "Histórico",
      metaHoje: "Meta de hoje", scoreboard: "Placar", clean: "Limpo", settings: "Configurações",
      proxPausa: "Próxima pausa", aCada: "a cada", tempoJogo: "Tempo de jogo",
      iniciar: "Iniciar", pausar: "Pausar", retomar: "Retomar", resetar: "Resetar",
      parado: "Parado", anda: "Em andamento", pausado: "Pausado", intervalo: "Intervalo",
      bebiAgua: "Bebi água", aguas: "águas", faltam: "faltam",
      semana: "Últimos 7 dias", media: "Média diária", metaBatida: "Meta batida em", de7: "de 7 dias",
      histHoje: "Histórico de hoje", vazioHoje: "Nenhuma água registrada hoje. Vá em Início e comece o timer! 💧", diasAnt: "Dias anteriores",
      footer: "Os dados ficam salvos neste navegador. O timer pode atrasar se a aba ficar em segundo plano.",
      alertTitle: "Hora de beber água!", alertBodyA: "Faça uma pausa e tome ", alertBodyB: ". Seu corpo agradece.", adiar: "Adiar 5 min",
      cfg: "Configurações", intervaloPadrao: "Intervalo padrão", volPorAgua: "Volume por água", metaDiaria: "Meta diária",
      somAlerta: "Som de alerta", somSub: "Toque ao chegar a hora", testar: "Testar", ativado: "Ativado", desativado: "Desativado",
      notif: "Notificações do sistema", notifSub: "Aviso mesmo em outra aba", concluir: "Concluir", minUnit: "min",
      idioma: "Idioma", temaEscuro: "Tema escuro", temaClaro: "Tema claro",
      msgVazio: "Bora começar a beber água!", msgLento: "Que tal acelerar um pouco?", msgBom: "Bom ritmo, continue assim.", msgQuase: "Quase lá, falta pouco!", msgBatida: "Meta batida! 🎉",
      locale: "pt-BR"
    },
    en: {
      brandTop: "Hydration", brandSub: "Break", inicio: "Home", historico: "History",
      metaHoje: "Today's goal", scoreboard: "Scoreboard", clean: "Clean", settings: "Settings",
      proxPausa: "Next break", aCada: "every", tempoJogo: "Game clock",
      iniciar: "Start", pausar: "Pause", retomar: "Resume", resetar: "Reset",
      parado: "Stopped", anda: "Running", pausado: "Paused", intervalo: "Interval",
      bebiAgua: "I drank", aguas: "waters", faltam: "left",
      semana: "Last 7 days", media: "Daily average", metaBatida: "Goal hit on", de7: "of 7 days",
      histHoje: "Today's log", vazioHoje: "No water logged today. Go to Home and start the timer! 💧", diasAnt: "Previous days",
      footer: "Data is saved in this browser. The timer may drift if the tab stays in the background.",
      alertTitle: "Time to drink water!", alertBodyA: "Take a break and drink ", alertBodyB: ". Your body will thank you.", adiar: "Snooze 5 min",
      cfg: "Settings", intervaloPadrao: "Default interval", volPorAgua: "Volume per water", metaDiaria: "Daily goal",
      somAlerta: "Alert sound", somSub: "Plays when it is time", testar: "Test", ativado: "On", desativado: "Off",
      notif: "System notifications", notifSub: "Alerts even on another tab", concluir: "Done", minUnit: "min",
      idioma: "Language", temaEscuro: "Dark theme", temaClaro: "Light theme",
      msgVazio: "Let's start drinking water!", msgLento: "How about speeding up a bit?", msgBom: "Good pace, keep it up.", msgQuase: "Almost there, just a bit more!", msgBatida: "Goal reached! 🎉",
      locale: "en-US"
    }
  };

  const THEMES = {
    limpo: {
      page: "#F4F6FA", stageBg: "#FFFFFF", stageBorder: "1px solid #EAEEF5",
      ink: "#131A24", inkMuted: "#697586",
      panelCard: "#FFFFFF", panelBorder: "1px solid #EAEEF5",
      chipBg: "#F4F6FA", chipBorder: "#DCE2EC", chipInk: "#344054",
      ringTrack: "#EAEEF5", ringColor: "#2F5BFF",
      digitColor: "#15296E", digitGlow: "none",
      fillGrad: "linear-gradient(90deg,#12B069,#2F5BFF)",
      shadowStage: "0 1px 2px rgba(19,26,36,.06),0 8px 20px rgba(19,26,36,.08)",
      shadowCard: "0 1px 2px rgba(19,26,36,.06),0 8px 20px rgba(19,26,36,.08)",
      sidebarBg: "#FFFFFF", sidebarBorder: "1px solid #EAEEF5", sidebarInk: "#344054"
    },
    placar: {
      page: "radial-gradient(1100px 560px at 60% -8%, #15296E 0%, #0B0F15 62%)",
      stageBg: "linear-gradient(165deg,#1A327F 0%,#0E1B49 100%)",
      stageBorder: "1px solid rgba(141,169,255,.22)",
      ink: "#EEF3FF", inkMuted: "rgba(219,229,255,.62)",
      panelCard: "rgba(255,255,255,.045)", panelBorder: "1px solid rgba(141,169,255,.16)",
      chipBg: "rgba(255,255,255,.07)", chipBorder: "rgba(141,169,255,.22)", chipInk: "#DBE5FF",
      ringTrack: "rgba(255,255,255,.10)", ringColor: "#5BDC99",
      digitColor: "#5BDC99", digitGlow: "0 0 26px rgba(91,220,153,.45)",
      fillGrad: "linear-gradient(90deg,#27C779,#5B7DFF)",
      shadowStage: "0 24px 56px rgba(0,0,0,.4)",
      shadowCard: "0 12px 30px rgba(0,0,0,.30)",
      sidebarBg: "linear-gradient(180deg,#15296E 0%,#0E1B49 100%)", sidebarBorder: "1px solid rgba(141,169,255,.16)", sidebarInk: "#DBE5FF"
    }
  };

  const clampNum = typeof clamp === "function"
    ? clamp
    : function fallbackClamp(value, min, max) {
        const n = Number(value);
        if (Number.isNaN(n)) return min;
        return Math.min(max, Math.max(min, Math.round(n)));
      };

  function dayKey(date) {
    const z = (n) => String(n).padStart(2, "0");
    return `${date.getFullYear()}-${z(date.getMonth() + 1)}-${z(date.getDate())}`;
  }

  function fmtClock(sec) {
    const safe = Math.max(0, Math.round(sec));
    const h = Math.floor(safe / 3600);
    const m = Math.floor((safe % 3600) / 60);
    const s = safe % 60;
    const z = (n) => String(n).padStart(2, "0");
    return h > 0 ? `${h}:${z(m)}:${z(s)}` : `${z(m)}:${z(s)}`;
  }

  const defaultState = {
    theme: "placar", activePage: "inicio", lang: "pt",
    intervalMin: 60, glassMl: 250, goalMl: 2000,
    remaining: 3600, totalSec: 3600, running: false, paused: false,
    days: {}, soundOn: true, notifOn: false,
    alertOpen: false, settingsOpen: false
  };

  function loadState() {
    let saved = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      saved = raw ? JSON.parse(raw) : null;
    } catch (error) {
      saved = null;
    }

    if (saved) {
      return {
        theme: saved.theme === "limpo" ? "limpo" : "placar",
        lang: saved.lang === "en" ? "en" : "pt",
        intervalMin: clampNum(saved.intervalMin || 60, 1, 240),
        glassMl: Math.max(50, Number(saved.glassMl) || 250),
        goalMl: Math.max(250, Number(saved.goalMl) || 2000),
        days: saved.days && typeof saved.days === "object" ? saved.days : {},
        soundOn: saved.soundOn !== false,
        notifOn: Boolean(saved.notifOn)
      };
    }

    // Hybrid migration: bring forward data from the previous app schema (pausa-hidratacao:v1).
    return migrateFromLegacy();
  }

  function migrateFromLegacy() {
    const base = {
      theme: "placar", lang: "pt", intervalMin: 60, glassMl: 250, goalMl: 2000,
      days: {}, soundOn: true, notifOn: false
    };

    try {
      const raw = localStorage.getItem(LEGACY_KEY);
      if (!raw) return base;
      const legacy = JSON.parse(raw);
      if (!legacy || typeof legacy !== "object") return base;

      const servingMl = Math.max(50, Number(legacy.servingMl) || 250);
      base.lang = legacy.locale === "en" ? "en" : "pt";
      base.intervalMin = clampNum(Number(legacy.intervalMinutes) || 60, 1, 240);
      base.glassMl = servingMl;
      base.goalMl = Math.max(250, Number(legacy.dailyGoalMl) || 2000);
      base.soundOn = legacy.soundEnabled !== false;
      base.notifOn = Boolean(legacy.notificationsEnabled);
      if (typeof migrateLegacyDays === "function") {
        base.days = migrateLegacyDays(legacy.history, servingMl);
      }
    } catch (error) {
      // Ignore corrupted legacy storage and start fresh.
    }

    return base;
  }

  const state = Object.assign({}, defaultState, loadState());
  state.remaining = state.intervalMin * 60;
  state.totalSec = state.intervalMin * 60;
  state.running = false;
  state.paused = false;
  state.alertOpen = false;
  state.settingsOpen = false;
  state.activePage = "inicio";

  let audioContext = null;
  let timerId = null;

  function persist() {
    const { theme, lang, intervalMin, glassMl, goalMl, days, soundOn, notifOn } = state;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ theme, lang, intervalMin, glassMl, goalMl, days, soundOn, notifOn }));
    } catch (error) {
      // Storage may be unavailable (private mode); ignore.
    }
  }

  function setState(patch, options = {}) {
    Object.assign(state, patch);
    if (options.save !== false) persist();
    render();
    if (typeof options.after === "function") options.after();
  }

  // --- Timer ---------------------------------------------------------------

  function tick() {
    if (!state.running || state.alertOpen) return;
    const next = (state.remaining || 0) - 1;
    if (next <= 0) {
      triggerAlert();
    } else {
      state.remaining = next;
      render();
    }
  }

  function triggerAlert() {
    setState({ remaining: 0, running: false, paused: false, alertOpen: true }, { save: false });
    beep();
    notify();
  }

  function startTimer() {
    const total = state.intervalMin * 60;
    setState({ running: true, paused: false, remaining: total, totalSec: total });
  }

  function pauseTimer() {
    setState({ running: false, paused: true });
  }

  function resumeTimer() {
    setState({ running: true, paused: false });
  }

  function resetTimer() {
    const total = state.intervalMin * 60;
    setState({ running: false, paused: false, remaining: total, totalSec: total });
  }

  function onPrimary() {
    if (state.running) return pauseTimer();
    if (state.paused) return resumeTimer();
    return startTimer();
  }

  function setIntervalMin(minutes) {
    const value = clampNum(minutes, 1, 240);
    const patch = { intervalMin: value };
    if (!state.running && !state.paused) {
      patch.remaining = value * 60;
      patch.totalSec = value * 60;
    }
    setState(patch);
  }

  // --- Water log -----------------------------------------------------------

  function addWater(after) {
    const key = dayKey(new Date());
    const days = Object.assign({}, state.days);
    const existing = days[key] ? { entries: (days[key].entries || []).slice() } : { entries: [] };
    existing.entries.push({ ts: Date.now(), ml: state.glassMl });
    days[key] = existing;
    setState({ days }, { after });
  }

  function confirmDrink() {
    addWater(() => {
      const total = state.intervalMin * 60;
      setState({ alertOpen: false, running: true, paused: false, remaining: total, totalSec: total });
    });
  }

  function snooze() {
    setState({ alertOpen: false, running: true, paused: false, remaining: 300, totalSec: 300 });
  }

  // --- Settings ------------------------------------------------------------

  function setGlass(value) {
    setState({ glassMl: Math.max(50, Number(value) || 50) });
  }

  function setGoal(value) {
    setState({ goalMl: Math.max(250, Number(value) || 250) });
  }

  function toggleSound() {
    setState({ soundOn: !state.soundOn });
  }

  function toggleNotif() {
    const next = !state.notifOn;
    if (next && "Notification" in window && Notification.permission !== "granted") {
      try {
        Notification.requestPermission().then((permission) => setState({ notifOn: permission === "granted" }));
      } catch (error) {
        setState({ notifOn: false });
      }
      return;
    }
    setState({ notifOn: next });
  }

  function setLang(code) {
    setState({ lang: code === "en" ? "en" : "pt" });
  }

  function toggleTheme() {
    setState({ theme: state.theme === "placar" ? "limpo" : "placar" });
  }

  function setPage(page) {
    setState({ activePage: page }, { save: false });
  }

  // --- Audio / notifications ----------------------------------------------

  function notify() {
    if (!state.notifOn) return;
    const L = T_STR[state.lang] || T_STR.pt;
    try {
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(L.alertTitle, {
          body: L.alertBodyA.trim() + (state.glassMl || 250) + " ml" + L.alertBodyB,
          tag: "hydration-break"
        });
      }
    } catch (error) {
      // Notifications unsupported; ignore.
    }
  }

  function beep(force) {
    if (!force && !state.soundOn) return;
    try {
      const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextCtor) return;
      if (!audioContext) audioContext = new AudioContextCtor();
      if (audioContext.state === "suspended") audioContext.resume();
      const now = audioContext.currentTime;
      [880, 1175, 1568].forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        oscillator.type = "sine";
        oscillator.frequency.value = frequency;
        oscillator.connect(gain);
        gain.connect(audioContext.destination);
        const at = now + index * 0.16;
        gain.gain.setValueAtTime(0, at);
        gain.gain.linearRampToValueAtTime(0.22, at + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, at + 0.15);
        oscillator.start(at);
        oscillator.stop(at + 0.16);
      });
    } catch (error) {
      // Audio unsupported; ignore.
    }
  }

  // --- Derived view model --------------------------------------------------

  function buildViewModel() {
    const theme = THEMES[state.theme] || THEMES.placar;
    const lang = state.lang || "pt";
    const L = T_STR[lang];
    const locale = L.locale;

    const total = state.totalSec || state.intervalMin * 60 || 3600;
    const remaining = Math.max(0, state.remaining == null ? total : state.remaining);
    const ringCirc = 2 * Math.PI * 132;
    const ringOffset = ringCirc * (1 - (total > 0 ? remaining / total : 0));

    let statusLabel = L.parado;
    let statusDot = "#98A2B3";
    if (state.running) { statusLabel = L.anda; statusDot = "#12B069"; }
    else if (state.paused) { statusLabel = L.pausado; statusDot = "#F59E0B"; }

    const todayKey = dayKey(new Date());
    const today = (state.days && state.days[todayKey]) || { entries: [] };
    const entries = today.entries || [];
    const consumed = entries.reduce((sum, entry) => sum + (entry.ml || 0), 0);
    const goal = state.goalMl || 2000;
    const goalPct = goal > 0 ? Math.min(100, Math.round((consumed / goal) * 100)) : 0;
    const glassesToGoal = Math.max(0, Math.ceil((goal - consumed) / (state.glassMl || 250)));

    const todayEntries = entries.slice().reverse().map((entry) => ({
      mlLabel: (entry.ml || 0) + " ml",
      time: new Date(entry.ts).toLocaleTimeString(locale, { hour: "2-digit", minute: "2-digit" })
    }));

    const pastDays = Object.keys(state.days || {})
      .filter((key) => key !== todayKey)
      .sort()
      .reverse()
      .slice(0, 7)
      .map((key) => {
        const es = state.days[key].entries || [];
        const ml = es.reduce((sum, entry) => sum + (entry.ml || 0), 0);
        const parts = key.split("-").map(Number);
        const label = new Date(parts[0], parts[1] - 1, parts[2]).toLocaleDateString(locale, {
          weekday: "short", day: "2-digit", month: "short"
        });
        return { label, countLabel: es.length + " " + L.aguas + " · " + ml.toLocaleString(locale) + " ml" };
      });

    const dateLabel = new Date().toLocaleDateString(locale, { weekday: "long", day: "2-digit", month: "long" });

    // Mascot face reacts to progress.
    const mfrac = goalPct / 100;
    const waterY = (14 + (1 - mfrac) * 104).toFixed(1);
    const waveD = `M-15 ${waterY} q12 -7 24 0 t24 0 t24 0 t24 0 t24 0 t24 0 V132 H-15 Z`;
    let mouthPath; let mascotMsg; let browLeft; let browRight;
    if (goalPct < 34) {
      mouthPath = "M41 80 Q50 73 59 80";
      browLeft = "M34 53 L45 57"; browRight = "M66 53 L55 57";
      mascotMsg = consumed === 0 ? L.msgVazio : L.msgLento;
    } else if (goalPct < 80) {
      mouthPath = "M42 78 H58";
      browLeft = "M35 54 L45 54"; browRight = "M65 54 L55 54";
      mascotMsg = L.msgBom;
    } else if (goalPct < 100) {
      mouthPath = "M41 76 Q50 83 59 76";
      browLeft = "M35 55 L45 52"; browRight = "M65 55 L55 52";
      mascotMsg = L.msgQuase;
    } else {
      mouthPath = "M39 75 Q50 87 61 75";
      browLeft = "M35 55 L45 51"; browRight = "M65 55 L55 51";
      mascotMsg = L.msgBatida;
    }

    const week = [];
    const weekMl = [];
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = dayKey(date);
      const es = (state.days[key] && state.days[key].entries) || [];
      const ml = es.reduce((sum, entry) => sum + (entry.ml || 0), 0);
      const pct = goal > 0 ? Math.min(100, Math.round((ml / goal) * 100)) : 0;
      weekMl.push(ml);
      week.push({
        label: date.toLocaleDateString(locale, { weekday: "short" }).replace(".", ""),
        heightStr: Math.max(3, pct) + "%",
        mlLabel: ml >= 1000 ? (ml / 1000).toFixed(1).replace(".", lang === "pt" ? "," : ".") : String(ml || ""),
        barColor: i === 0 ? "#12B069" : "#5B7DFF",
        labelColor: i === 0 ? theme.ink : theme.inkMuted,
        labelWeight: i === 0 ? 700 : 600,
        isToday: i === 0
      });
    }
    const weekAvg = Math.round(weekMl.reduce((sum, value) => sum + value, 0) / 7);
    const daysHit = weekMl.filter((value) => value >= goal).length;

    const page = state.activePage || "inicio";
    const countRest = lang === "pt"
      ? L.aguas + " · " + L.faltam + " " + glassesToGoal
      : L.aguas + " · " + glassesToGoal + " " + L.faltam;

    return {
      theme, themeName: state.theme, L, locale,
      ringCirc, ringOffset,
      timeStr: fmtClock(remaining),
      intervalLabel: (state.intervalMin || 60) + " " + L.minUnit, intervalMin: state.intervalMin || 60,
      aCadaLabel: L.aCada + " " + (state.intervalMin || 60) + " " + L.minUnit,
      statusLabel, statusDot,
      isRunning: Boolean(state.running),
      primaryLabel: state.running ? L.pausar : (state.paused ? L.retomar : L.iniciar),
      shortcuts: [5, 10, 15, 20, 30],
      consumedStr: consumed.toLocaleString(locale), goalStr: goal.toLocaleString(locale),
      goalPctStr: goalPct + "%", glassLabel: (state.glassMl || 250) + " ml", glassesToGoal,
      todayCount: entries.length, countRest,
      todayEntries, pastDays,
      dateLabel,
      waterY, waveD, mouthPath, mascotMsg, browLeft, browRight,
      week, weekAvgStr: weekAvg.toLocaleString(locale) + " ml", daysHitLabel: daysHit + " " + L.de7,
      page,
      pageTitle: page === "historico" ? L.historico : L.inicio,
      isDark: state.theme === "placar",
      themeToggleLabel: state.theme === "placar" ? L.temaEscuro : L.temaClaro,
      themeTrackBg: state.theme === "placar" ? "#2F5BFF" : "#C3CCDA",
      themeKnobLeft: state.theme === "placar" ? "18px" : "2px",
      glassChips: [200, 250, 300, 500],
      goalChips: [1500, 2000, 2500, 3000],
      goalMl: goal, glassMl: state.glassMl || 250,
      soundOn: Boolean(state.soundOn), notifOn: Boolean(state.notifOn),
      soundLabel: state.soundOn ? L.ativado : L.desativado,
      notifLabel: state.notifOn ? L.ativado : L.desativado,
      alertOpen: Boolean(state.alertOpen),
      alertBody: L.alertBodyA + (state.glassMl || 250) + " ml" + L.alertBodyB,
      settingsOpen: Boolean(state.settingsOpen)
    };
  }

  // --- DOM helpers ---------------------------------------------------------

  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (value == null || value === false) return;
      if (key === "style") node.setAttribute("style", value);
      else if (key === "class") node.className = value;
      else if (key === "html") node.innerHTML = value;
      else if (key === "text") node.textContent = value;
      else if (key.startsWith("on") && typeof value === "function") node.addEventListener(key.slice(2).toLowerCase(), value);
      else node.setAttribute(key, value);
    });
    (Array.isArray(children) ? children : [children]).forEach((child) => {
      if (child == null) return;
      node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
    });
    return node;
  }

  function svg(markup) {
    const wrapper = el("span", { class: "hb-svg" });
    wrapper.innerHTML = markup;
    return wrapper.firstElementChild;
  }

  function chipStyle(active, theme, mono) {
    if (active) {
      return "padding:8px 14px;border-radius:999px;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:13px;cursor:pointer;transition:all .15s;background:#2F5BFF;color:#fff;border:1px solid #2F5BFF;";
    }
    return `padding:8px 14px;border-radius:999px;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:13px;cursor:pointer;transition:all .15s;background:${theme.chipBg};color:${theme.chipInk};border:1px solid ${theme.chipBorder};`;
  }

  function modalChipStyle(active) {
    if (active) {
      return "padding:8px 12px;border-radius:10px;border:1px solid #2F5BFF;background:#2F5BFF;color:#fff;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:13px;cursor:pointer;";
    }
    return "padding:8px 12px;border-radius:10px;border:1px solid #DCE2EC;background:#F4F6FA;color:#344054;font-family:'JetBrains Mono',monospace;font-weight:700;font-size:13px;cursor:pointer;";
  }

  function segStyle(active) {
    if (active) {
      return "padding:8px 0;flex:1;border:none;border-radius:999px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-size:13px;cursor:pointer;transition:all .18s;background:#2F5BFF;color:#fff;box-shadow:0 4px 10px rgba(47,91,255,.32);";
    }
    return "padding:8px 0;flex:1;border:none;border-radius:999px;font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-size:13px;cursor:pointer;transition:all .18s;background:transparent;color:#697586;";
  }

  function toggleStyle(on) {
    if (on) {
      return "padding:9px 17px;border-radius:999px;border:none;font-weight:700;font-size:13px;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;transition:all .15s;min-width:104px;background:#12B069;color:#fff;";
    }
    return "padding:9px 17px;border-radius:999px;border:none;font-weight:700;font-size:13px;font-family:'Plus Jakarta Sans',sans-serif;cursor:pointer;transition:all .15s;min-width:104px;background:#EAEEF5;color:#697586;";
  }

  function navStyle(active, theme) {
    const base = `display:flex;align-items:center;gap:11px;width:100%;padding:12px 13px;border-radius:12px;border:none;background:transparent;color:${theme.sidebarInk};font-family:'Plus Jakarta Sans',sans-serif;font-weight:600;font-size:14px;cursor:pointer;transition:all .15s;text-align:left;`;
    return active ? base + "background:#2F5BFF;color:#fff;box-shadow:0 6px 14px rgba(47,91,255,.3);" : base;
  }

  // --- Render --------------------------------------------------------------

  const ICONS = {
    drop: '<svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c3.5 4 6 7 6 10a6 6 0 0 1-12 0c0-3 2.5-6 6-10z"/></svg>',
    home: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-7 8 7M6 10v10h12V10"/></svg>',
    chart: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 17l6-6 4 4 8-8M21 7h-5M21 7v5"/></svg>',
    moon: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    sun: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    gear: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2l1.4 2.8 3.1-.7.7 3.1L20 10l-2.8 1.8.7 3.1-3.1.7L12 19l-1.8-2.4-3.1.7.7-3.1L5 12l2.5-1.8-.7-3.1 3.1.7z"/></svg>',
    plus: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>',
    dropSmall: '<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 3c3.5 4 6 7 6 10a6 6 0 0 1-12 0c0-3 2.5-6 6-10z"/></svg>',
    play: '<svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><path d="M7 4.5l13 7.5-13 7.5z"/></svg>',
    pauseIcon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="#fff"><rect x="6" y="5" width="4" height="14" rx="1.2"/><rect x="14" y="5" width="4" height="14" rx="1.2"/></svg>',
    reset: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8M21 4v4h-4"/><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16M3 20v-4h4"/></svg>',
    check: '<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>',
    close: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
    bigDrop: '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c3.5 4 6 7 6 10a6 6 0 0 1-12 0c0-3 2.5-6 6-10z"/></svg>'
  };

  function renderSidebar(vm) {
    const t = vm.theme;
    const logo = el("div", { style: "width:42px;height:42px;border-radius:13px;background:linear-gradient(150deg,#2F5BFF,#12B069);display:grid;place-items:center;box-shadow:0 8px 18px rgba(47,91,255,.28);" }, [svg(ICONS.drop)]);
    const brand = el("div", { style: "display:flex;flex-direction:column;gap:1px;" }, [
      el("span", { style: `font-family:'Sora',sans-serif;font-weight:800;font-size:16px;letter-spacing:-.02em;color:${t.ink};`, text: vm.L.brandTop }),
      el("span", { style: "font-weight:700;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:#5B7DFF;", text: vm.L.brandSub })
    ]);
    const header = el("div", { style: "display:flex;align-items:center;gap:12px;padding:4px 6px 18px;" }, [logo, brand]);

    const navInicio = el("button", { style: navStyle(vm.page === "inicio", t), onclick: () => setPage("inicio") }, [svg(ICONS.home), document.createTextNode(" " + vm.L.inicio)]);
    const navHist = el("button", { style: navStyle(vm.page === "historico", t), onclick: () => setPage("historico") }, [svg(ICONS.chart), document.createTextNode(" " + vm.L.historico)]);

    const spacer = el("div", { style: "flex:1;" });

    const goalChip = el("div", { style: `padding:14px;border-radius:15px;background:${t.chipBg};border:1px solid ${t.chipBorder};display:flex;flex-direction:column;gap:9px;margin-bottom:6px;` }, [
      el("div", { style: "display:flex;align-items:center;justify-content:space-between;" }, [
        el("span", { style: `font-size:11px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:${t.inkMuted};`, text: vm.L.metaHoje }),
        el("span", { style: `font-family:'JetBrains Mono',monospace;font-weight:700;font-size:14px;color:${t.digitColor};`, text: vm.goalPctStr })
      ]),
      el("div", { style: `height:8px;border-radius:999px;background:${t.ringTrack};overflow:hidden;` }, [
        el("div", { style: `height:100%;width:${vm.goalPctStr};border-radius:999px;background:${t.fillGrad};transition:width .4s ease;` })
      ])
    ]);

    const themeToggle = el("button", { title: vm.themeToggleLabel, style: `display:flex;align-items:center;justify-content:space-between;gap:11px;width:100%;padding:11px 13px;border-radius:12px;border:1px solid ${t.chipBorder};background:${t.chipBg};color:${t.sidebarInk};font-weight:600;font-size:14px;cursor:pointer;transition:all .15s;`, onclick: toggleTheme }, [
      el("span", { style: "display:inline-flex;align-items:center;gap:11px;" }, [
        svg(vm.isDark ? ICONS.moon : ICONS.sun),
        document.createTextNode(" " + vm.themeToggleLabel)
      ]),
      el("span", { style: `width:38px;height:22px;border-radius:999px;background:${vm.themeTrackBg};position:relative;flex:0 0 auto;transition:background .2s;` }, [
        el("span", { style: `position:absolute;top:2px;left:${vm.themeKnobLeft};width:18px;height:18px;border-radius:999px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.3);transition:left .2s;` })
      ])
    ]);

    const settingsBtn = el("button", { style: `display:flex;align-items:center;gap:11px;width:100%;padding:11px 13px;border-radius:12px;border:none;background:transparent;color:${t.sidebarInk};font-weight:600;font-size:14px;cursor:pointer;transition:all .15s;`, onclick: () => setState({ settingsOpen: true }, { save: false }) }, [
      svg(ICONS.gear), document.createTextNode(" " + vm.L.settings)
    ]);

    return el("aside", { style: `width:244px;flex:0 0 244px;background:${t.sidebarBg};border-right:${t.sidebarBorder};padding:24px 18px;display:flex;flex-direction:column;gap:8px;position:sticky;top:0;height:100vh;transition:all .35s ease;` }, [
      header, navInicio, navHist, spacer, goalChip, themeToggle, settingsBtn
    ]);
  }

  function renderMascotCard(vm) {
    const t = vm.theme;
    const mascotSvg = `<svg width="98" height="118" viewBox="0 0 100 120">
      <defs><clipPath id="hbMascot"><path d="M50 8 C50 8 86 52 86 80 A36 36 0 0 1 14 80 C14 52 50 8 50 8 Z"/></clipPath></defs>
      <g clip-path="url(#hbMascot)">
        <rect x="0" y="0" width="100" height="120" fill="#E8F0FF"/>
        <rect x="0" y="${vm.waterY}" width="100" height="120" fill="#3D6BFF" style="transition:y .6s ease;"/>
        <path d="${vm.waveD}" fill="#4D77FF" style="animation:hbWave 2.6s linear infinite;transition:d .6s ease;"/>
      </g>
      <path d="M50 8 C50 8 86 52 86 80 A36 36 0 0 1 14 80 C14 52 50 8 50 8 Z" fill="none" stroke="#2F5BFF" stroke-width="3.5"/>
      <path d="${vm.browLeft}" stroke="#0E1B49" stroke-width="2.6" stroke-linecap="round" fill="none" style="transition:d .3s ease;"/>
      <path d="${vm.browRight}" stroke="#0E1B49" stroke-width="2.6" stroke-linecap="round" fill="none" style="transition:d .3s ease;"/>
      <circle cx="40" cy="63" r="4" fill="#0E1B49"/><circle cx="60" cy="63" r="4" fill="#0E1B49"/>
      <circle cx="41.6" cy="61.5" r="1.3" fill="#fff"/><circle cx="61.6" cy="61.5" r="1.3" fill="#fff"/>
      <path d="${vm.mouthPath}" fill="none" stroke="#0E1B49" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="transition:d .3s ease;"/>
    </svg>`;

    const mascot = el("div", { style: "flex:0 0 auto;animation:hbDrop 3.6s ease-in-out infinite;" });
    mascot.innerHTML = mascotSvg;

    const info = el("div", { style: "flex:1;min-width:230px;display:flex;flex-direction:column;gap:9px;" }, [
      el("div", { style: "display:flex;align-items:center;gap:10px;" }, [
        el("span", { style: `font-weight:700;font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:${t.inkMuted};`, text: vm.L.metaHoje }),
        el("span", { style: `padding:2px 9px;border-radius:999px;background:${t.chipBg};border:1px solid ${t.chipBorder};font-family:'JetBrains Mono',monospace;font-weight:700;font-size:12px;color:${t.digitColor};`, text: vm.goalPctStr })
      ]),
      el("div", { style: "display:flex;align-items:baseline;gap:8px;" }, [
        el("span", { style: `font-family:'JetBrains Mono',monospace;font-weight:700;font-size:38px;line-height:1;color:${t.digitColor};`, text: vm.consumedStr }),
        el("span", { style: `font-family:'JetBrains Mono',monospace;font-weight:500;font-size:18px;color:${t.inkMuted};`, text: "/ " + vm.goalStr + " ml" })
      ]),
      el("div", { style: `height:12px;border-radius:999px;background:${t.ringTrack};overflow:hidden;max-width:420px;` }, [
        el("div", { style: `height:100%;width:${vm.goalPctStr};border-radius:999px;background:${t.fillGrad};transition:width .4s ease;` })
      ]),
      el("span", { style: `font-size:14px;font-weight:600;color:${t.digitColor};`, text: vm.mascotMsg })
    ]);

    const addBtn = el("button", { style: "display:inline-flex;align-items:center;justify-content:center;gap:9px;width:100%;padding:15px;border:none;border-radius:14px;background:#12B069;color:#fff;font-weight:700;font-size:15px;cursor:pointer;box-shadow:0 8px 18px rgba(18,176,105,.28);transition:transform .15s,box-shadow .15s;", onclick: () => addWater() }, [
      svg(ICONS.plus), document.createTextNode(" " + vm.L.bebiAgua + " (" + vm.glassLabel + ")")
    ]);
    const countRow = el("div", { style: `display:flex;align-items:center;justify-content:center;gap:7px;font-size:13px;color:${t.inkMuted};` });
    countRow.appendChild(svg(ICONS.dropSmall.replace("currentColor", t.digitColor)));
    const countText = el("span", {}, [
      el("b", { style: `color:${t.ink};font-weight:700;`, text: String(vm.todayCount) }),
      document.createTextNode(" " + vm.countRest)
    ]);
    countRow.appendChild(countText);
    const action = el("div", { style: "flex:0 0 auto;display:flex;flex-direction:column;gap:10px;width:230px;min-width:200px;" }, [addBtn, countRow]);

    return el("section", { style: `background:${t.panelCard};border:${t.panelBorder};border-radius:24px;padding:26px 28px;box-shadow:${t.shadowCard};display:flex;align-items:center;gap:28px;flex-wrap:wrap;transition:all .35s ease;` }, [mascot, info, action]);
  }

  function renderTimerCard(vm) {
    const t = vm.theme;
    const ringSvg = `<svg width="260" height="260" viewBox="0 0 300 300" style="transform:rotate(-90deg);">
      <circle cx="150" cy="150" r="132" fill="none" stroke="${t.ringTrack}" stroke-width="16"/>
      <circle cx="150" cy="150" r="132" fill="none" stroke="${t.ringColor}" stroke-width="16" stroke-linecap="round" stroke-dasharray="${vm.ringCirc}" stroke-dashoffset="${vm.ringOffset}" style="transition:stroke-dashoffset 1s linear,stroke .35s ease;"/>
    </svg>`;
    const ringWrap = el("div", { style: "position:relative;width:260px;height:260px;flex:0 0 auto;" });
    ringWrap.innerHTML = ringSvg;
    ringWrap.appendChild(el("div", { style: "position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;" }, [
      el("span", { style: `font-weight:700;font-size:10px;letter-spacing:.08em;text-transform:uppercase;color:${t.inkMuted};`, text: vm.L.proxPausa }),
      el("span", { style: `font-family:'JetBrains Mono',monospace;font-weight:700;font-size:52px;line-height:1;color:${t.digitColor};text-shadow:${t.digitGlow};font-variant-numeric:tabular-nums;`, text: vm.timeStr }),
      el("span", { style: `font-size:12px;color:${t.inkMuted};`, text: vm.aCadaLabel })
    ]));

    const statusRow = el("div", { style: "display:flex;align-items:center;gap:12px;" }, [
      el("span", { style: `font-weight:700;font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:${t.inkMuted};`, text: vm.L.tempoJogo }),
      el("span", { style: `display:inline-flex;align-items:center;gap:7px;padding:5px 12px;border-radius:999px;background:${t.chipBg};border:1px solid ${t.chipBorder};font-size:12px;font-weight:600;color:${t.chipInk};` }, [
        el("span", { style: `width:7px;height:7px;border-radius:999px;background:${vm.statusDot};` }),
        document.createTextNode(vm.statusLabel)
      ])
    ]);

    const primaryBtn = el("button", { style: "display:inline-flex;align-items:center;gap:9px;padding:14px 28px;border:none;border-radius:14px;background:#2F5BFF;color:#fff;font-weight:700;font-size:16px;cursor:pointer;box-shadow:0 8px 18px rgba(47,91,255,.32);transition:transform .15s,box-shadow .15s;", onclick: onPrimary }, [
      svg(vm.isRunning ? ICONS.pauseIcon : ICONS.play),
      document.createTextNode(" " + vm.primaryLabel)
    ]);
    const resetBtn = el("button", { style: `display:inline-flex;align-items:center;gap:8px;padding:14px 22px;border-radius:14px;background:transparent;border:1px solid ${t.chipBorder};color:${t.chipInk};font-weight:600;font-size:15px;cursor:pointer;transition:all .15s;`, onclick: resetTimer }, [
      svg(ICONS.reset), document.createTextNode(" " + vm.L.resetar)
    ]);
    const actions = el("div", { style: "display:flex;gap:12px;flex-wrap:wrap;" }, [primaryBtn, resetBtn]);

    const divider = el("div", { style: `height:1px;background:${t.chipBorder};` });

    const intervalHead = el("div", { style: "display:flex;align-items:center;justify-content:space-between;" }, [
      el("span", { style: `font-weight:700;font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:${t.inkMuted};`, text: vm.L.intervalo }),
      el("span", { style: `font-family:'JetBrains Mono',monospace;font-weight:700;font-size:14px;color:${t.ink};`, text: vm.intervalLabel })
    ]);
    const shortcutRow = el("div", { style: "display:flex;gap:8px;flex-wrap:wrap;" }, vm.shortcuts.map((m) =>
      el("button", { style: chipStyle(vm.intervalMin === m, t), onclick: () => setIntervalMin(m), text: m + " " + vm.L.minUnit })
    ));
    const slider = el("input", { type: "range", min: "1", max: "240", value: String(vm.intervalMin), style: "width:100%;accent-color:#2F5BFF;cursor:pointer;" });
    slider.addEventListener("input", (event) => setIntervalMin(parseInt(event.target.value, 10) || 1));
    const intervalBlock = el("div", { style: "display:flex;flex-direction:column;gap:12px;" }, [intervalHead, shortcutRow, slider]);

    const right = el("div", { style: "flex:1;min-width:280px;display:flex;flex-direction:column;gap:18px;" }, [statusRow, actions, divider, intervalBlock]);

    return el("section", { style: `background:${t.stageBg};border:${t.stageBorder};border-radius:24px;padding:28px;box-shadow:${t.shadowStage};display:flex;align-items:center;gap:34px;flex-wrap:wrap;justify-content:center;transition:all .35s ease;` }, [ringWrap, right]);
  }

  function renderHistory(vm) {
    const t = vm.theme;
    const weekHead = el("div", { style: "display:flex;align-items:center;justify-content:space-between;" }, [
      el("span", { style: `font-weight:700;font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:${t.inkMuted};`, text: vm.L.semana }),
      svg(ICONS.chart.replace("currentColor", t.inkMuted))
    ]);
    const bars = el("div", { style: "display:flex;align-items:stretch;gap:14px;height:180px;" }, vm.week.map((w) =>
      el("div", { style: "flex:1;display:flex;flex-direction:column;align-items:center;gap:8px;justify-content:flex-end;min-width:0;" }, [
        el("span", { style: `font-size:11px;font-weight:700;color:${t.inkMuted};font-family:'JetBrains Mono',monospace;`, text: w.mlLabel }),
        el("div", { style: `width:100%;flex:1;display:flex;align-items:flex-end;border-radius:9px;background:${t.ringTrack};overflow:hidden;` }, [
          el("div", { style: `width:100%;height:${w.heightStr};background:${w.barColor};border-radius:9px 9px 2px 2px;transition:height .5s ease;` })
        ]),
        el("span", { style: `font-size:12px;color:${w.labelColor};font-weight:${w.labelWeight};text-transform:capitalize;`, text: w.label })
      ])
    ));
    const weekFoot = el("div", { style: `display:flex;justify-content:space-between;font-size:13px;color:${t.inkMuted};border-top:1px solid ${t.chipBorder};padding-top:14px;` }, [
      el("span", {}, [document.createTextNode(vm.L.media + ": "), el("b", { style: `color:${t.ink};font-weight:700;`, text: vm.weekAvgStr })]),
      el("span", {}, [document.createTextNode(vm.L.metaBatida + " "), el("b", { style: `color:${t.ink};font-weight:700;`, text: vm.daysHitLabel })])
    ]);
    const weekCard = el("section", { style: `background:${t.panelCard};border:${t.panelBorder};border-radius:24px;padding:26px;box-shadow:${t.shadowCard};display:flex;flex-direction:column;gap:16px;transition:all .35s ease;` }, [weekHead, bars, weekFoot]);

    const logChildren = [el("span", { style: `font-weight:700;font-size:11px;letter-spacing:.07em;text-transform:uppercase;color:${t.inkMuted};`, text: vm.L.histHoje })];
    if (vm.todayEntries.length) {
      logChildren.push(el("div", { style: "display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:9px;" }, vm.todayEntries.map((entry) => {
        const left = el("span", { style: `display:inline-flex;align-items:center;gap:9px;font-size:13px;font-weight:600;color:${t.ink};` });
        left.appendChild(svg('<svg width="15" height="15" viewBox="0 0 24 24" fill="#12B069" stroke="none"><path d="M12 3c3.5 4 6 7 6 10a6 6 0 0 1-12 0c0-3 2.5-6 6-10z"/></svg>'));
        left.appendChild(document.createTextNode(" " + entry.mlLabel));
        return el("div", { style: `display:flex;align-items:center;justify-content:space-between;padding:11px 14px;border-radius:12px;background:${t.chipBg};border:1px solid ${t.chipBorder};` }, [
          left,
          el("span", { style: `font-family:'JetBrains Mono',monospace;font-size:13px;color:${t.inkMuted};`, text: entry.time })
        ]);
      })));
    } else {
      logChildren.push(el("div", { style: `padding:22px;border-radius:12px;border:1px dashed ${t.chipBorder};text-align:center;font-size:14px;color:${t.inkMuted};`, text: vm.L.vazioHoje }));
    }
    if (vm.pastDays.length) {
      const pastRows = vm.pastDays.map((d) => el("div", { style: `display:flex;align-items:center;justify-content:space-between;padding:11px 4px;border-bottom:1px solid ${t.chipBorder};` }, [
        el("span", { style: `font-size:14px;font-weight:600;color:${t.ink};text-transform:capitalize;`, text: d.label }),
        el("span", { style: `font-size:13px;color:${t.inkMuted};font-family:'JetBrains Mono',monospace;`, text: d.countLabel })
      ]));
      logChildren.push(el("div", { style: "display:flex;flex-direction:column;gap:8px;margin-top:6px;" }, [
        el("span", { style: `font-size:13px;font-weight:700;color:${t.ink};`, text: vm.L.diasAnt })
      ].concat(pastRows)));
    }
    const logCard = el("section", { style: `background:${t.panelCard};border:${t.panelBorder};border-radius:24px;padding:26px;box-shadow:${t.shadowCard};display:flex;flex-direction:column;gap:14px;transition:all .35s ease;` }, logChildren);

    return el("div", { style: "display:flex;flex-direction:column;gap:20px;" }, [weekCard, logCard]);
  }

  function renderAlert(vm) {
    const drop = el("div", { style: "width:86px;height:86px;margin:0 auto 18px;border-radius:26px;background:linear-gradient(150deg,#2F5BFF,#12B069);display:grid;place-items:center;animation:hbDrop 2s ease-in-out infinite;box-shadow:0 14px 30px rgba(47,91,255,.32);" });
    drop.appendChild(svg(ICONS.bigDrop));
    const confirmBtn = el("button", { style: "display:inline-flex;align-items:center;justify-content:center;gap:9px;width:100%;padding:14px;border:none;border-radius:14px;background:#12B069;color:#fff;font-weight:700;font-size:16px;cursor:pointer;box-shadow:0 8px 18px rgba(18,176,105,.3);", onclick: confirmDrink }, [
      svg(ICONS.check), document.createTextNode(" " + vm.L.bebiAgua)
    ]);
    const snoozeBtn = el("button", { style: "width:100%;padding:13px;border-radius:14px;background:#F4F6FA;border:1px solid #DCE2EC;color:#344054;font-weight:600;font-size:15px;cursor:pointer;", onclick: snooze, text: vm.L.adiar });
    const card = el("div", { style: "width:min(420px,100%);background:#fff;border-radius:28px;padding:34px 30px;text-align:center;box-shadow:0 30px 70px rgba(0,0,0,.42);animation:hbPop .28s cubic-bezier(.34,1.56,.64,1);" }, [
      drop,
      el("h2", { style: "margin:0 0 8px;font-family:'Sora',sans-serif;font-weight:800;font-size:26px;color:#131A24;letter-spacing:-.02em;", text: vm.L.alertTitle }),
      el("p", { style: "margin:0 0 24px;font-size:15px;color:#697586;line-height:1.5;", text: vm.alertBody }),
      el("div", { style: "display:flex;flex-direction:column;gap:10px;" }, [confirmBtn, snoozeBtn])
    ]);
    return el("div", { role: "dialog", "aria-modal": "true", style: "position:fixed;inset:0;z-index:1100;background:rgba(11,15,21,.55);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px;animation:hbFade .2s ease;" }, [card]);
  }

  function renderSettings(vm) {
    const close = () => setState({ settingsOpen: false }, { save: false });
    const header = el("div", { style: "display:flex;align-items:center;justify-content:space-between;" }, [
      el("h2", { style: "margin:0;font-family:'Sora',sans-serif;font-weight:800;font-size:22px;color:#131A24;letter-spacing:-.02em;", text: vm.L.cfg }),
      el("button", { style: "width:36px;height:36px;display:grid;place-items:center;border-radius:10px;background:#F4F6FA;border:1px solid #DCE2EC;color:#344054;cursor:pointer;", onclick: close }, [svg(ICONS.close)])
    ]);

    const langBlock = el("div", { style: "display:flex;flex-direction:column;gap:10px;" }, [
      el("span", { style: "font-size:13px;font-weight:700;color:#131A24;", text: vm.L.idioma }),
      el("div", { style: "display:flex;background:#F4F6FA;border:1px solid #DCE2EC;border-radius:999px;padding:4px;gap:3px;" }, [
        el("button", { style: segStyle(vm.L.locale === "pt-BR"), onclick: () => setLang("pt"), text: "Português" }),
        el("button", { style: segStyle(vm.L.locale === "en-US"), onclick: () => setLang("en"), text: "English" })
      ])
    ]);

    const intervalSlider = el("input", { type: "range", min: "1", max: "240", value: String(vm.intervalMin), style: "width:100%;accent-color:#2F5BFF;cursor:pointer;" });
    intervalSlider.addEventListener("input", (event) => setIntervalMin(parseInt(event.target.value, 10) || 1));
    const intervalBlock = el("div", { style: "display:flex;flex-direction:column;gap:10px;" }, [
      el("div", { style: "display:flex;align-items:center;justify-content:space-between;" }, [
        el("span", { style: "font-size:13px;font-weight:700;color:#131A24;", text: vm.L.intervaloPadrao }),
        el("span", { style: "font-family:'JetBrains Mono',monospace;font-weight:700;font-size:14px;color:#2F5BFF;", text: vm.intervalLabel })
      ]),
      intervalSlider
    ]);

    const glassInput = el("input", { type: "number", min: "50", step: "50", value: String(vm.glassMl), style: "width:100%;padding:11px 13px;border-radius:11px;border:1px solid #DCE2EC;background:#fff;color:#131A24;font-family:'JetBrains Mono',monospace;font-size:14px;" });
    glassInput.addEventListener("change", (event) => setGlass(parseInt(event.target.value, 10) || 50));
    const glassBlock = el("div", { style: "display:flex;flex-direction:column;gap:10px;" }, [
      el("span", { style: "font-size:13px;font-weight:700;color:#131A24;", text: vm.L.volPorAgua }),
      el("div", { style: "display:flex;gap:8px;flex-wrap:wrap;" }, vm.glassChips.map((v) =>
        el("button", { style: modalChipStyle(vm.glassMl === v), onclick: () => setGlass(v), text: v + " ml" })
      )),
      glassInput
    ]);

    const goalInput = el("input", { type: "number", min: "250", step: "100", value: String(vm.goalMl), style: "width:100%;padding:11px 13px;border-radius:11px;border:1px solid #DCE2EC;background:#fff;color:#131A24;font-family:'JetBrains Mono',monospace;font-size:14px;" });
    goalInput.addEventListener("change", (event) => setGoal(parseInt(event.target.value, 10) || 250));
    const goalBlock = el("div", { style: "display:flex;flex-direction:column;gap:10px;" }, [
      el("span", { style: "font-size:13px;font-weight:700;color:#131A24;", text: vm.L.metaDiaria }),
      el("div", { style: "display:flex;gap:8px;flex-wrap:wrap;" }, vm.goalChips.map((v) =>
        el("button", { style: modalChipStyle(vm.goalMl === v), onclick: () => setGoal(v), text: (v / 1000).toString().replace(".", vm.L.locale === "pt-BR" ? "," : ".") + " L" })
      )),
      goalInput
    ]);

    const soundBlock = el("div", { style: "display:flex;align-items:center;justify-content:space-between;gap:12px;" }, [
      el("div", { style: "display:flex;flex-direction:column;gap:2px;" }, [
        el("span", { style: "font-size:13px;font-weight:700;color:#131A24;", text: vm.L.somAlerta }),
        el("span", { style: "font-size:12px;color:#697586;", text: vm.L.somSub })
      ]),
      el("div", { style: "display:flex;gap:8px;" }, [
        el("button", { style: "padding:9px 14px;border-radius:999px;border:1px solid #DCE2EC;background:#fff;color:#344054;font-weight:600;font-size:13px;cursor:pointer;", onclick: () => beep(true), text: vm.L.testar }),
        el("button", { style: toggleStyle(vm.soundOn), onclick: toggleSound, text: vm.soundLabel })
      ])
    ]);

    const notifBlock = el("div", { style: "display:flex;align-items:center;justify-content:space-between;gap:12px;" }, [
      el("div", { style: "display:flex;flex-direction:column;gap:2px;" }, [
        el("span", { style: "font-size:13px;font-weight:700;color:#131A24;", text: vm.L.notif }),
        el("span", { style: "font-size:12px;color:#697586;", text: vm.L.notifSub })
      ]),
      el("button", { style: toggleStyle(vm.notifOn), onclick: toggleNotif, text: vm.notifLabel })
    ]);

    const doneBtn = el("button", { style: "width:100%;padding:13px;border:none;border-radius:14px;background:#2F5BFF;color:#fff;font-weight:700;font-size:15px;cursor:pointer;box-shadow:0 8px 18px rgba(47,91,255,.3);", onclick: close, text: vm.L.concluir });

    const panel = el("div", { style: "width:min(460px,100%);max-height:88vh;overflow-y:auto;background:#fff;border-radius:26px;padding:28px;box-shadow:0 30px 70px rgba(0,0,0,.42);animation:hbPop .25s cubic-bezier(.34,1.56,.64,1);display:flex;flex-direction:column;gap:22px;", onclick: (event) => event.stopPropagation() }, [
      header, langBlock, intervalBlock, glassBlock, goalBlock, soundBlock, notifBlock, doneBtn
    ]);

    return el("div", { style: "position:fixed;inset:0;z-index:1100;background:rgba(11,15,21,.55);backdrop-filter:blur(4px);display:flex;align-items:center;justify-content:center;padding:20px;animation:hbFade .2s ease;", onclick: close }, [panel]);
  }

  function render() {
    const vm = buildViewModel();
    const t = vm.theme;
    const appRoot = document.getElementById("app");
    if (!appRoot) return;

    document.documentElement.lang = vm.L.locale;
    document.title = vm.L.brandTop + " " + vm.L.brandSub;
    document.body.style.background = t.page;
    document.body.style.color = t.ink;

    const main = el("main", { style: "flex:1;min-width:0;padding:30px 30px 48px;display:flex;flex-direction:column;gap:20px;" });
    main.appendChild(el("div", { style: "display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap;" }, [
      el("h1", { style: `margin:0;font-family:'Sora',sans-serif;font-weight:800;font-size:28px;letter-spacing:-.02em;color:${t.ink};`, text: vm.pageTitle }),
      el("span", { style: `font-size:14px;font-weight:600;color:${t.inkMuted};text-transform:capitalize;`, text: vm.dateLabel })
    ]));

    if (vm.page === "inicio") {
      main.appendChild(el("div", { style: "display:flex;flex-direction:column;gap:20px;" }, [renderMascotCard(vm), renderTimerCard(vm)]));
    } else {
      main.appendChild(renderHistory(vm));
    }

    main.appendChild(el("p", { style: `text-align:center;font-size:12px;color:${t.inkMuted};margin:4px 0 0;`, text: vm.L.footer }));

    const shell = el("div", { style: "display:flex;min-height:100vh;font-family:'Plus Jakarta Sans',system-ui,sans-serif;transition:background .35s ease,color .35s ease;" }, [renderSidebar(vm), main]);

    appRoot.replaceChildren(shell);
    if (vm.alertOpen) appRoot.appendChild(renderAlert(vm));
    if (vm.settingsOpen) appRoot.appendChild(renderSettings(vm));
  }

  function boot() {
    render();
    persist();
    timerId = window.setInterval(tick, 1000);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        if (state.alertOpen) snooze();
        else if (state.settingsOpen) setState({ settingsOpen: false }, { save: false });
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(typeof window !== "undefined" ? window : globalThis);
