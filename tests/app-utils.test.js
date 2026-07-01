const test = require("node:test");
const assert = require("node:assert/strict");

const {
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
} = require("../public/app-utils");

const defaultState = {
  locale: "pt-BR",
  intervalMinutes: 30,
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

test("minutesToMs converts minutes to milliseconds", () => {
  assert.equal(minutesToMs(1), 60000);
  assert.equal(minutesToMs(5), 300000);
  assert.equal(minutesToMs(30), 1800000);
});

test("formatMs formats milliseconds as mm:ss", () => {
  assert.equal(formatMs(0), "00:00");
  assert.equal(formatMs(1000), "00:01");
  assert.equal(formatMs(60000), "01:00");
  assert.equal(formatMs(61000), "01:01");
});

test("formatMs rounds remaining partial seconds up", () => {
  assert.equal(formatMs(1), "00:01");
  assert.equal(formatMs(59999), "01:00");
});

test("clamp rounds values and keeps them inside the range", () => {
  assert.equal(clamp(10.4, 1, 240), 10);
  assert.equal(clamp(10.5, 1, 240), 11);
  assert.equal(clamp(0, 1, 240), 1);
  assert.equal(clamp(300, 1, 240), 240);
});

test("clamp falls back to the minimum for invalid numeric input", () => {
  assert.equal(clamp(Number.NaN, 1, 240), 1);
});

test("todayKey formats a date as yyyy-mm-dd", () => {
  assert.equal(todayKey(new Date(2026, 5, 24)), "2026-06-24");
  assert.equal(todayKey(new Date(2026, 0, 5)), "2026-01-05");
});

test("formatDate formats stored yyyy-mm-dd dates by locale", () => {
  assert.equal(formatDate("2026-06-24", "pt-BR"), "24/06/2026");
  assert.equal(formatDate("2026-06-24", "en"), "06/24/2026");
});

test("formatClockTime formats a timestamp as a local hour and minute", () => {
  assert.equal(formatClockTime(new Date(2026, 5, 24, 15, 40).getTime(), "pt-BR"), "15:40");
});

test("normalizeHistory keeps valid positive daily counts", () => {
  assert.deepEqual(normalizeHistory({
    "2026-06-24": 3,
    "2026-06-25": "2",
    "invalid-date": 5,
    "2026-06-26": 0,
    "2026-06-27": -1
  }), {
    "2026-06-24": 3,
    "2026-06-25": 2
  });
});

test("normalizeState falls back to safe defaults for invalid saved state", () => {
  assert.deepEqual(normalizeState({
    locale: "fr",
    intervalMinutes: 999,
    dailyGoalMl: 0,
    servingMl: 0,
    soundEnabled: "yes",
    notificationsEnabled: "no",
    isRunning: true,
    isPaused: false,
    nextAlertAt: "soon",
    history: []
  }, defaultState, { allowedLocales: ["pt-BR", "en"] }), {
    ...defaultState,
    intervalMinutes: 240,
    dailyGoalMl: 250,
    servingMl: 50
  });
});

test("normalizeState migrates old cup-based goals to milliliters", () => {
  assert.equal(normalizeState({
    dailyGoal: 8
  }, defaultState, { allowedLocales: ["pt-BR", "en"] }).dailyGoalMl, 2000);
});

test("normalizeState preserves a valid running timer", () => {
  assert.deepEqual(normalizeState({
    locale: "en",
    intervalMinutes: 15,
    dailyGoalMl: 2500,
    servingMl: 300,
    soundEnabled: false,
    notificationsEnabled: true,
    isRunning: true,
    isPaused: false,
    nextAlertAt: 1800000000000,
    history: { "2026-06-24": 4 }
  }, defaultState, { allowedLocales: ["pt-BR", "en"] }), {
    ...defaultState,
    locale: "en",
    intervalMinutes: 15,
    dailyGoalMl: 2500,
    servingMl: 300,
    soundEnabled: false,
    notificationsEnabled: true,
    isRunning: true,
    nextAlertAt: 1800000000000,
    history: { "2026-06-24": 4 }
  });
});

test("normalizeState preserves a valid paused timer", () => {
  assert.deepEqual(normalizeState({
    intervalMinutes: 20,
    isRunning: true,
    isPaused: true,
    remainingMs: 45000,
    nextAlertAt: 1800000000000
  }, defaultState, { allowedLocales: ["pt-BR", "en"] }), {
    ...defaultState,
    intervalMinutes: 20,
    isRunning: true,
    isPaused: true,
    nextAlertAt: null,
    remainingMs: 45000
  });
});

test("startTimer starts a timer using a clamped interval", () => {
  assert.deepEqual(startTimer(defaultState, 999, 1000), {
    ...defaultState,
    intervalMinutes: 240,
    isRunning: true,
    isPaused: false,
    nextAlertAt: 14401000,
    remainingMs: null
  });
});

test("togglePauseTimer pauses a running timer with remaining time", () => {
  assert.deepEqual(togglePauseTimer({
    ...defaultState,
    intervalMinutes: 10,
    isRunning: true,
    nextAlertAt: 70000
  }, 10000), {
    ...defaultState,
    intervalMinutes: 10,
    isRunning: true,
    isPaused: true,
    nextAlertAt: 70000,
    remainingMs: 60000
  });
});

test("togglePauseTimer resumes a paused timer from remaining time", () => {
  assert.deepEqual(togglePauseTimer({
    ...defaultState,
    intervalMinutes: 10,
    isRunning: true,
    isPaused: true,
    remainingMs: 45000
  }, 10000), {
    ...defaultState,
    intervalMinutes: 10,
    isRunning: true,
    isPaused: false,
    nextAlertAt: 55000,
    remainingMs: null
  });
});

test("togglePauseTimer leaves stopped timers unchanged", () => {
  assert.equal(togglePauseTimer(defaultState, 10000), defaultState);
});

test("resetTimer stops the timer without clearing preferences or history", () => {
  assert.deepEqual(resetTimer({
    ...defaultState,
    intervalMinutes: 15,
    isRunning: true,
    isPaused: true,
    nextAlertAt: 70000,
    remainingMs: 12000,
    history: { "2026-06-24": 2 }
  }), {
    ...defaultState,
    intervalMinutes: 15,
    isRunning: false,
    isPaused: false,
    nextAlertAt: null,
    remainingMs: null,
    history: { "2026-06-24": 2 }
  });
});

test("scheduleNextTimer schedules the next alert without changing interval preference", () => {
  assert.deepEqual(scheduleNextTimer({
    ...defaultState,
    intervalMinutes: 30,
    isRunning: false
  }, 5, 1000), {
    ...defaultState,
    intervalMinutes: 30,
    isRunning: true,
    isPaused: false,
    nextAlertAt: 301000,
    remainingMs: null
  });
});

test("getGoalProgress calculates volume progress and completion", () => {
  assert.deepEqual(getGoalProgress(3, 2000, 250), {
    count: 3,
    consumedMl: 750,
    goalMl: 2000,
    servingMl: 250,
    percentage: 38,
    isComplete: false
  });

  assert.deepEqual(getGoalProgress(9, 2000, 250), {
    count: 9,
    consumedMl: 2250,
    goalMl: 2000,
    servingMl: 250,
    percentage: 100,
    isComplete: true
  });
});

test("getGoalProgress normalizes invalid values", () => {
  assert.deepEqual(getGoalProgress("bad", 0, 0), {
    count: 0,
    consumedMl: 0,
    goalMl: 250,
    servingMl: 50,
    percentage: 0,
    isComplete: false
  });
});

test("migrateLegacyDays expands legacy daily counts into timestamped entries", () => {
  const days = migrateLegacyDays({ "2026-06-24": 3, "invalid": 5, "2026-06-25": 0 }, 250);
  const keys = Object.keys(days).sort();
  assert.deepEqual(keys, ["2026-06-24"]);
  assert.equal(days["2026-06-24"].entries.length, 3);
  days["2026-06-24"].entries.forEach((entry) => {
    assert.equal(entry.ml, 250);
    assert.equal(typeof entry.ts, "number");
    assert.equal(new Date(entry.ts).getFullYear(), 2026);
  });
});

test("migrateLegacyDays clamps the serving volume to the supported range", () => {
  const days = migrateLegacyDays({ "2026-06-24": 1 }, 5);
  assert.equal(days["2026-06-24"].entries[0].ml, 50);
});

test("formatVolume displays milliliters and liters", () => {
  assert.equal(formatVolume(750, "pt-BR"), "750 ml");
  assert.equal(formatVolume(2000, "pt-BR"), "2 L");
  assert.equal(formatVolume(1750, "pt-BR"), "1,75 L");
  assert.equal(formatVolume(1750, "en"), "1.75 L");
});
