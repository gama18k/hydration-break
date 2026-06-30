(function defineAppUtils(root) {
  function minutesToMs(minutes) {
    return minutes * 60 * 1000;
  }

  function formatMs(ms) {
    const totalSeconds = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  function clamp(value, min, max) {
    if (Number.isNaN(value)) return min;
    return Math.min(max, Math.max(min, Math.round(value)));
  }

  function todayKey(date = new Date()) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatDate(date, locale) {
    const [year, month, day] = date.split("-").map(Number);
    return new Intl.DateTimeFormat(locale, {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }).format(new Date(year, month - 1, day));
  }

  function formatClockTime(timestamp, locale) {
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(timestamp));
  }

  function normalizeState(savedState, defaultState, options = {}) {
    const source = isPlainObject(savedState) ? savedState : {};
    const allowedLocales = options.allowedLocales || [];
    const intervalMinutes = clamp(Number(source.intervalMinutes ?? defaultState.intervalMinutes), 1, 240);
    const dailyGoalMl = normalizeDailyGoalMl(source, defaultState);
    const servingMl = clamp(Number(source.servingMl ?? defaultState.servingMl), 50, 2000);
    const locale = allowedLocales.includes(source.locale) ? source.locale : defaultState.locale;
    const nextAlertAt = normalizeFutureTimestamp(source.nextAlertAt);
    const remainingMs = normalizeDuration(source.remainingMs);
    const wantsPaused = Boolean(source.isRunning && source.isPaused);
    const canResumePausedTimer = wantsPaused && remainingMs !== null;
    const canResumeRunningTimer = Boolean(source.isRunning && !source.isPaused && nextAlertAt !== null);
    const isRunning = canResumePausedTimer || canResumeRunningTimer;

    return {
      ...defaultState,
      locale,
      intervalMinutes,
      dailyGoalMl,
      servingMl,
      soundEnabled: getBoolean(source.soundEnabled, defaultState.soundEnabled),
      notificationsEnabled: getBoolean(source.notificationsEnabled, defaultState.notificationsEnabled),
      isRunning,
      isPaused: isRunning && canResumePausedTimer,
      nextAlertAt: canResumeRunningTimer ? nextAlertAt : null,
      remainingMs: canResumePausedTimer ? remainingMs : null,
      history: normalizeHistory(source.history)
    };
  }

  function normalizeHistory(history) {
    if (!isPlainObject(history)) return {};

    return Object.entries(history).reduce((normalized, [date, count]) => {
      const numericCount = Number(count);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(numericCount) || numericCount <= 0) {
        return normalized;
      }

      normalized[date] = Math.floor(numericCount);
      return normalized;
    }, {});
  }

  function getGoalProgress(count, goalMl, servingMl) {
    const safeCount = Math.max(0, Math.floor(Number(count) || 0));
    const safeGoalMl = clamp(Number(goalMl), 250, 10000);
    const safeServingMl = clamp(Number(servingMl), 50, 2000);
    const consumedMl = safeCount * safeServingMl;
    const percentage = Math.min(100, Math.round((consumedMl / safeGoalMl) * 100));

    return {
      count: safeCount,
      consumedMl,
      goalMl: safeGoalMl,
      servingMl: safeServingMl,
      percentage,
      isComplete: consumedMl >= safeGoalMl
    };
  }

  function formatVolume(ml, locale = "pt-BR") {
    const safeMl = Math.max(0, Math.round(Number(ml) || 0));
    if (safeMl >= 1000 && safeMl % 1000 === 0) {
      return `${safeMl / 1000} L`;
    }
    if (safeMl >= 1000) {
      return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(safeMl / 1000)} L`;
    }
    return `${safeMl} ml`;
  }

  function startTimer(state, intervalMinutes, now = Date.now()) {
    const minutes = clamp(Number(intervalMinutes), 1, 240);

    return {
      ...state,
      isRunning: true,
      isPaused: false,
      intervalMinutes: minutes,
      nextAlertAt: now + minutesToMs(minutes),
      remainingMs: null
    };
  }

  function togglePauseTimer(state, now = Date.now()) {
    if (!state.isRunning) return state;

    if (state.isPaused) {
      return {
        ...state,
        isPaused: false,
        nextAlertAt: now + (state.remainingMs || minutesToMs(state.intervalMinutes)),
        remainingMs: null
      };
    }

    return {
      ...state,
      isPaused: true,
      remainingMs: Math.max(0, Number(state.nextAlertAt) - now)
    };
  }

  function resetTimer(state) {
    return {
      ...state,
      isRunning: false,
      isPaused: false,
      nextAlertAt: null,
      remainingMs: null
    };
  }

  function scheduleNextTimer(state, minutes, now = Date.now()) {
    return {
      ...state,
      isRunning: true,
      isPaused: false,
      nextAlertAt: now + minutesToMs(minutes),
      remainingMs: null
    };
  }

  function normalizeFutureTimestamp(value) {
    const timestamp = Number(value);
    return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : null;
  }

  function normalizeDuration(value) {
    const duration = Number(value);
    return Number.isFinite(duration) && duration >= 0 ? duration : null;
  }

  function normalizeDailyGoalMl(source, defaultState) {
    if (source.dailyGoalMl !== undefined) {
      return clamp(Number(source.dailyGoalMl), 250, 10000);
    }
    if (source.dailyGoal !== undefined) {
      return clamp(Number(source.dailyGoal) * (defaultState.servingMl || 250), 250, 10000);
    }
    return clamp(Number(defaultState.dailyGoalMl), 250, 10000);
  }

  function getBoolean(value, fallback) {
    return typeof value === "boolean" ? value : fallback;
  }

  function migrateLegacyDays(legacyHistory, servingMl) {
    const normalized = normalizeHistory(legacyHistory);
    const safeServingMl = clamp(Number(servingMl), 50, 2000);
    return Object.entries(normalized).reduce((days, [date, count]) => {
      const [year, month, day] = date.split("-").map(Number);
      const entries = [];
      for (let index = 0; index < count; index += 1) {
        // Spread the synthetic timestamps across the day so the history list keeps a stable order.
        const minutes = Math.min(1439, Math.round((index * 1440) / Math.max(1, count)));
        const ts = new Date(year, month - 1, day, Math.floor(minutes / 60), minutes % 60).getTime();
        entries.push({ ts, ml: safeServingMl });
      }
      days[date] = { entries };
      return days;
    }, {});
  }

  function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }

  const utils = {
    clamp,
    formatClockTime,
    formatDate,
    formatMs,
    formatVolume,
    getGoalProgress,
    migrateLegacyDays,
    minutesToMs,
    normalizeHistory,
    normalizeState,
    resetTimer,
    scheduleNextTimer,
    startTimer,
    todayKey,
    togglePauseTimer
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = utils;
    return;
  }

  root.PausaHidratacaoUtils = utils;
})(typeof window !== "undefined" ? window : globalThis);
