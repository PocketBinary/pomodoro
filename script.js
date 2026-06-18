// ============================================================
// CONSTANTS
// ============================================================
const STORAGE_KEY = "pomodoro-app-state-v10";
const NOTIFICATION_PROMPT_KEY = "pomodoro-notification-prompted-v1";
const TITLE_BASE = "Pomodoro";
const RING_RADIUS = 104;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const CURRENT_SCHEMA_VERSION = 1;
const THEME_VALUES = ["light", "dark"];
const LANGUAGE_VALUES = ["en", "fr"];

const defaultOptions = { soundEnabled: true, theme: "light", language: "en" };

const copy = {
  en: {
    appTitle: "Pomodoro",
    skipLink: "Skip to main content",
    timerModesAria: "Timer modes",
    timerDisplayAria: "Timer display",
    progressAria: "Session progress",
    modes: {
      focus: "Focus",
      short: "Short Break",
      long: "Long Break",
    },
    modeText: {
      focus: "Stay focused",
      short: "Take a short break",
      long: "Take a longer break",
    },
    status: {
      ready: "Ready",
      running: "Running",
      paused: "Paused",
    },
    theme: {
      light: "Light",
      dark: "Dark",
      switchToLight: "Switch to light theme",
      switchToDark: "Switch to dark theme",
      selected: (themeLabel) => `${themeLabel} theme selected.`,
    },
    language: {
      group: "Language selection",
      enSelected: "English selected.",
      frSelected: "French selected.",
    },
    controls: {
      start: "Start",
      pause: "Pause",
      reset: "Reset",
      startTimer: "Start timer",
      pauseTimer: "Pause timer",
      resetTimer: "Reset timer",
    },
    settings: {
      title: "Settings",
      subtitle: "Adjust your rhythm without losing progress.",
      focusMinutes: "Focus minutes",
      shortBreakMinutes: "Short break minutes",
      longBreakMinutes: "Long break minutes",
      sessionsBeforeLongBreak: "Sessions before long break",
      soundNotifications: "Sound notifications",
    },
    summary: {
      focusLength: "Focus Length",
      shortBreak: "Short Break",
      longBreak: "Long Break",
      today: "Today",
      completedFocusSessions: "Completed focus sessions",
      totalFocusTime: "Total focus time",
      session: (number) => `Session ${number}`,
      minutes: (number) => `${number} min`,
    },
    footer: {
      credits: "© 2026 GenPass · Created by PocketBinary",
      quote: "One tomato at a time, return to calm focus.",
      github: "GitHub",
      githubAria: "View the Pomodoro repository on GitHub",
    },
    notifications: {
      body: "Press Start when you are ready for the next session.",
      completeTitle: (modeLabel) => `Pomodoro · ${modeLabel} complete`,
    },
    announcements: {
      complete: (modeLabel) => `${modeLabel} complete. Press Start to continue.`,
      started: (modeText) => `${modeText} timer started.`,
      reset: "Timer reset.",
      paused: "Timer paused.",
      selected: (modeLabel) => `${modeLabel} selected.`,
    },
  },
  fr: {
    appTitle: "Pomodoro",
    skipLink: "Aller au contenu principal",
    timerModesAria: "Modes du minuteur",
    timerDisplayAria: "Affichage du minuteur",
    progressAria: "Progression de la session",
    modes: {
      focus: "Focus",
      short: "Pause courte",
      long: "Pause longue",
    },
    modeText: {
      focus: "Reste concentré",
      short: "Prends une courte pause",
      long: "Prends une pause plus longue",
    },
    status: {
      ready: "Prêt",
      running: "En cours",
      paused: "En pause",
    },
    theme: {
      light: "Clair",
      dark: "Sombre",
      switchToLight: "Passer au thème clair",
      switchToDark: "Passer au thème sombre",
      selected: (themeLabel) => `Thème ${themeLabel.toLowerCase()} sélectionné.`,
    },
    language: {
      group: "Sélection de la langue",
      enSelected: "Anglais sélectionné.",
      frSelected: "Français sélectionné.",
    },
    controls: {
      start: "Démarrer",
      pause: "Pause",
      reset: "Réinitialiser",
      startTimer: "Démarrer le minuteur",
      pauseTimer: "Mettre le minuteur en pause",
      resetTimer: "Réinitialiser le minuteur",
    },
    settings: {
      title: "Réglages",
      subtitle: "Ajuste ton rythme sans perdre ta progression.",
      focusMinutes: "Minutes de focus",
      shortBreakMinutes: "Minutes de pause courte",
      longBreakMinutes: "Minutes de pause longue",
      sessionsBeforeLongBreak: "Sessions avant pause longue",
      soundNotifications: "Notifications sonores",
    },
    summary: {
      focusLength: "Durée de focus",
      shortBreak: "Pause courte",
      longBreak: "Pause longue",
      today: "Aujourd'hui",
      completedFocusSessions: "Sessions de focus terminées",
      totalFocusTime: "Temps total de focus",
      session: (number) => `Session ${number}`,
      minutes: (number) => `${number} min`,
    },
    footer: {
      credits: "© 2026 GenPass · Créé par PocketBinary",
      quote: "Une tomate à la fois, retrouve le calme et la concentration.",
      github: "GitHub",
      githubAria: "Voir le dépôt Pomodoro sur GitHub",
    },
    notifications: {
      body: "Appuie sur Démarrer quand tu es prêt pour la prochaine session.",
      completeTitle: (modeLabel) => `Pomodoro · ${modeLabel} terminée`,
    },
    announcements: {
      complete: (modeLabel) => `${modeLabel} terminée. Appuie sur Démarrer pour continuer.`,
      started: (modeText) => `Minuteur lancé : ${modeText}.`,
      reset: "Minuteur réinitialisé.",
      paused: "Minuteur en pause.",
      selected: (modeLabel) => `${modeLabel} sélectionné.`,
    },
  },
};

// Build a clean state object used for first visits and invalid saved data.
const getDefaultState = () => ({
  _schemaVersion: CURRENT_SCHEMA_VERSION,
  settings: { focus: 25, shortBreak: 5, longBreak: 15, sessions: 4 },
  options: { ...defaultOptions },
  progress: {
    mode: "focus",
    pendingMode: null,
    remainingSeconds: 25 * 60,
    currentDurationSeconds: 25 * 60,
    sessionNumber: 1,
    completedSessions: 0,
    totalFocusMinutes: 0,
    isRunning: false,
    lastTickAt: null,
  },
});

// Keep numeric user input inside the accepted UI range.
const clampValue = (value, min, max) => Math.min(Math.max(value, min), max);

// Convert a second count into the mm:ss timer format.
const formatTime = (totalSeconds) => {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

// Return the short user-facing label for a timer mode.
const getModeLabel = (mode = "focus", language = "en") => {
  const safeLanguage = getSafeLanguage(language);
  return copy[safeLanguage].modes[mode] || copy[safeLanguage].modes.focus;
};

// Return the helper text shown below the timer for a mode.
const getModeText = (mode = "focus", language = "en") => {
  const safeLanguage = getSafeLanguage(language);
  return copy[safeLanguage].modeText[mode] || copy[safeLanguage].modeText.focus;
};

// Keep theme values constrained to the supported theme list.
const getSafeTheme = (theme) => (THEME_VALUES.includes(theme) ? theme : "light");

// Keep language values constrained to the supported language list.
const getSafeLanguage = (language) => (LANGUAGE_VALUES.includes(language) ? language : "en");

// ============================================================
// DOM REFERENCES
// ============================================================
const dom = {
  skipLink: document.getElementById("skipLink"),
  timeDisplay: document.getElementById("timeDisplay"),
  modeText: document.getElementById("modeText"),
  srAnnouncement: document.getElementById("srAnnouncement"),
  progressRing: document.getElementById("progressRing"),
  timerDisplay: document.getElementById("timer-display"),
  sessionCount: document.getElementById("sessionCount"),
  statusBadge: document.getElementById("statusBadge"),
  startPauseBtn: document.getElementById("startPauseBtn"),
  resetBtn: document.getElementById("resetBtn"),
  themeToggleBtn: document.getElementById("themeToggleBtn"),
  themeLabel: document.getElementById("themeLabel"),
  languageEnBtn: document.getElementById("languageEnBtn"),
  languageFrBtn: document.getElementById("languageFrBtn"),
  modeSwitcher: document.getElementById("modeSwitcher"),
  modeFocusBtn: document.getElementById("modeFocusBtn"),
  modeShortBtn: document.getElementById("modeShortBtn"),
  modeLongBtn: document.getElementById("modeLongBtn"),
  focusLengthTitle: document.getElementById("focusLengthTitle"),
  shortBreakTitle: document.getElementById("shortBreakTitle"),
  longBreakTitle: document.getElementById("longBreakTitle"),
  settingsTitle: document.getElementById("settingsTitle"),
  settingsSubtitle: document.getElementById("settingsSubtitle"),
  focusInputLabel: document.getElementById("focusInputLabel"),
  shortInputLabel: document.getElementById("shortInputLabel"),
  longInputLabel: document.getElementById("longInputLabel"),
  sessionsInputLabel: document.getElementById("sessionsInputLabel"),
  soundNotificationsLabel: document.getElementById("soundNotificationsLabel"),
  focusInput: document.getElementById("focusInput"),
  shortInput: document.getElementById("shortInput"),
  longInput: document.getElementById("longInput"),
  sessionsInput: document.getElementById("sessionsInput"),
  soundEnabledInput: document.getElementById("soundEnabledInput"),
  focusLabel: document.getElementById("focusLabel"),
  shortLabel: document.getElementById("shortLabel"),
  longLabel: document.getElementById("longLabel"),
  todayLabel: document.getElementById("todayLabel"),
  completedSessionsLabel: document.getElementById("completedSessionsLabel"),
  totalFocusTimeLabel: document.getElementById("totalFocusTimeLabel"),
  completedCount: document.getElementById("completedCount"),
  totalFocus: document.getElementById("totalFocus"),
  footerCredits: document.getElementById("footerCredits"),
  footerQuote: document.getElementById("footerQuote"),
  githubLink: document.getElementById("githubLink"),
  githubLabel: document.getElementById("githubLabel"),
};

if (Object.values(dom).some((el) => !el)) {
  throw new Error("Pomodoro DOM is incomplete");
}

// ============================================================
// STATE VALIDATION (hardened localStorage)
// ============================================================
const validateState = (parsed) => {
  if (!parsed || typeof parsed !== "object") return null;
  if (parsed._schemaVersion !== CURRENT_SCHEMA_VERSION) return null;

  const { settings, options, progress } = parsed;
  if (!settings || typeof settings !== "object") return null;
  if (!options || typeof options !== "object") return null;
  if (!progress || typeof progress !== "object") return null;

  const isFiniteNum = (v) => typeof v === "number" && Number.isFinite(v);
  const isBool = (v) => typeof v === "boolean";
  const isStrOrNull = (v) => typeof v === "string" || v === null;
  const validMode = (v) => ["focus", "short", "long"].includes(v);
  const validTheme = (v) => THEME_VALUES.includes(v);
  const validLanguage = (v) => LANGUAGE_VALUES.includes(v);

  if (!isFiniteNum(settings.focus)) return null;
  if (!isFiniteNum(settings.shortBreak)) return null;
  if (!isFiniteNum(settings.longBreak)) return null;
  if (!isFiniteNum(settings.sessions)) return null;
  if (!isBool(options.soundEnabled)) return null;
  if (options.theme !== undefined && !validTheme(options.theme)) return null;
  if (options.language !== undefined && !validLanguage(options.language))
    return null;
  if (!validMode(progress.mode)) return null;
  if (!isStrOrNull(progress.pendingMode)) return null;
  if (progress.pendingMode !== null && !validMode(progress.pendingMode))
    return null;
  if (!isFiniteNum(progress.remainingSeconds)) return null;
  if (!isFiniteNum(progress.currentDurationSeconds)) return null;
  if (!isFiniteNum(progress.sessionNumber)) return null;
  if (!isFiniteNum(progress.completedSessions)) return null;
  if (!isFiniteNum(progress.totalFocusMinutes)) return null;
  if (!isBool(progress.isRunning)) return null;
  if (progress.lastTickAt !== null && !isFiniteNum(Number(progress.lastTickAt)))
    return null;

  return parsed;
};

// ============================================================
// SETTINGS HELPERS
// ============================================================
// Read and sanitize all duration inputs from the settings panel.
const readDurations = () => {
  const focus = clampValue(Number(dom.focusInput.value) || 25, 1, 120);
  const shortBreak = clampValue(Number(dom.shortInput.value) || 5, 1, 60);
  const longBreak = clampValue(Number(dom.longInput.value) || 15, 1, 60);
  const sessions = clampValue(Number(dom.sessionsInput.value) || 4, 1, 20);
  dom.focusInput.value = focus;
  dom.shortInput.value = shortBreak;
  dom.longInput.value = longBreak;
  dom.sessionsInput.value = sessions;
  return { focus, shortBreak, longBreak, sessions };
};

// Populate settings inputs from saved state while enforcing safe bounds.
const setDurationInputs = (settings) => {
  dom.focusInput.value = clampValue(Number(settings.focus) || 25, 1, 120);
  dom.shortInput.value = clampValue(Number(settings.shortBreak) || 5, 1, 60);
  dom.longInput.value = clampValue(Number(settings.longBreak) || 15, 1, 60);
  dom.sessionsInput.value = clampValue(Number(settings.sessions) || 4, 1, 20);
};

// Resolve a mode into its active duration in seconds.
const getModeDurationSeconds = (mode) => {
  const { focus, shortBreak, longBreak } = readDurations();
  if (mode === "focus") return focus * 60;
  if (mode === "short") return shortBreak * 60;
  return longBreak * 60;
};

// Choose the next timer mode after the current session finishes.
const getNextModeAfterCurrent = ({ mode, completedSessions, sessions }) => {
  if (mode === "focus") {
    const nextCompleted = completedSessions + 1;
    return nextCompleted % sessions === 0 ? "long" : "short";
  }
  return "focus";
};

// ============================================================
// STORAGE
// ============================================================
// Load persisted state and fall back to defaults if storage is missing or invalid.
const loadState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getDefaultState();
    const parsed = JSON.parse(raw);
    const validated = validateState(parsed);
    return validated || getDefaultState();
  } catch {
    return getDefaultState();
  }
};

// Persist state without breaking the app if browser storage is unavailable.
const saveState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
};

// ============================================================
// MAIN APP
// ============================================================
// Create the app runtime after the DOM is ready.
const initPomodoro = () => {
  let timerId = null;
  let mode = "focus";
  let pendingMode = null;
  let remainingSeconds = 25 * 60;
  let currentDurationSeconds = 25 * 60;
  let sessionNumber = 1;
  let completedSessions = 0;
  let totalFocusMinutes = 0;
  let isRunning = false;
  let lastTickAt = null;
  let options = { ...defaultOptions };
  let audioContext = null;

  const getLanguage = () => getSafeLanguage(options.language);
  const getText = () => copy[getLanguage()];

  // --- Screen reader announcements ---
  // Clear and rewrite the live region so assistive tech announces repeated messages.
  const announce = (message) => {
    dom.srAnnouncement.textContent = "";
    window.setTimeout(() => {
      dom.srAnnouncement.textContent = message;
    }, 10);
  };

  // --- Title update ---
  // Mirror the active timer state in the browser tab title.
  const updateTitle = () => {
    document.title = `${formatTime(remainingSeconds)} · ${getModeLabel(mode, getLanguage())} · ${TITLE_BASE}`;
  };

  // --- Status badge ---
  // Update the pill label and color for the current timer state.
  const updateStatusBadge = (statusKey = "ready") => {
    const text = getText();
    dom.statusBadge.textContent = text.status[statusKey] || text.status.ready;
    dom.statusBadge.className = "rounded-full px-3 py-1 text-sm font-medium";
    if (statusKey === "running")
      dom.statusBadge.classList.add("bg-emerald-50", "text-emerald-700");
    else if (statusKey === "paused")
      dom.statusBadge.classList.add("bg-amber-50", "text-amber-700");
    else dom.statusBadge.classList.add("bg-slate-100", "text-slate-700");
  };

  // --- Theme ---
  // Apply the selected visual theme and keep switch accessibility state in sync.
  const applyTheme = (theme) => {
    const text = getText();
    const safeTheme = getSafeTheme(theme);
    document.body.dataset.theme = safeTheme;
    document.documentElement.dataset.theme = safeTheme;
    document.documentElement.style.colorScheme = safeTheme;
    dom.themeLabel.textContent = safeTheme === "dark" ? text.theme.dark : text.theme.light;
    dom.themeToggleBtn.setAttribute("aria-checked", safeTheme === "dark" ? "true" : "false");
    dom.themeToggleBtn.setAttribute(
      "aria-label",
      safeTheme === "dark" ? text.theme.switchToLight : text.theme.switchToDark,
    );
    document.querySelectorAll('meta[name="theme-color"]').forEach((themeColor) => {
      themeColor.setAttribute("content", safeTheme === "dark" ? "#0B1120" : "#F5F6F8");
    });
  };

  // --- Language ---
  // Apply localized UI strings and accessibility labels.
  const applyLanguage = () => {
    const language = getLanguage();
    const text = getText();
    document.documentElement.lang = language;
    dom.languageEnBtn.setAttribute("aria-pressed", language === "en" ? "true" : "false");
    dom.languageFrBtn.setAttribute("aria-pressed", language === "fr" ? "true" : "false");
    dom.languageEnBtn.parentElement.setAttribute("aria-label", text.language.group);

    dom.skipLink.textContent = text.skipLink;
    dom.modeSwitcher.setAttribute("aria-label", text.timerModesAria);
    dom.timerDisplay.setAttribute("aria-label", text.timerDisplayAria);
    dom.progressRing.setAttribute("aria-label", text.progressAria);
    dom.modeFocusBtn.textContent = text.modes.focus;
    dom.modeShortBtn.textContent = text.modes.short;
    dom.modeLongBtn.textContent = text.modes.long;
    dom.focusLengthTitle.textContent = text.summary.focusLength;
    dom.shortBreakTitle.textContent = text.summary.shortBreak;
    dom.longBreakTitle.textContent = text.summary.longBreak;
    dom.settingsTitle.textContent = text.settings.title;
    dom.settingsSubtitle.textContent = text.settings.subtitle;
    dom.focusInputLabel.textContent = text.settings.focusMinutes;
    dom.shortInputLabel.textContent = text.settings.shortBreakMinutes;
    dom.longInputLabel.textContent = text.settings.longBreakMinutes;
    dom.sessionsInputLabel.textContent = text.settings.sessionsBeforeLongBreak;
    dom.soundNotificationsLabel.textContent = text.settings.soundNotifications;
    dom.todayLabel.textContent = text.summary.today;
    dom.completedSessionsLabel.textContent = text.summary.completedFocusSessions;
    dom.totalFocusTimeLabel.textContent = text.summary.totalFocusTime;
    dom.resetBtn.textContent = text.controls.reset;
    dom.resetBtn.setAttribute("aria-label", text.controls.resetTimer);
    dom.footerCredits.textContent = text.footer.credits;
    dom.footerQuote.textContent = text.footer.quote;
    dom.githubLabel.textContent = text.footer.github;
    dom.githubLink.setAttribute("aria-label", text.footer.githubAria);
    applyTheme(options.theme);
  };

  // --- Mode tabs ARIA + visual state ---
  const applyModeSelection = () => {
    const buttons = [
      { el: dom.modeFocusBtn, targetMode: "focus" },
      { el: dom.modeShortBtn, targetMode: "short" },
      { el: dom.modeLongBtn, targetMode: "long" },
    ];

    const baseClasses = [
      "rounded-full",
      "px-4",
      "py-1",
      "text-sm",
      "font-semibold",
      "transition",
    ];
    const inactiveClasses = ["text-slate-500", "hover:text-slate-900"];
    const activeClasses = ["bg-slate-900", "text-white"];

    buttons.forEach(({ el, targetMode }) => {
      const active = mode === targetMode;
      el.className = "";
      baseClasses.forEach((c) => el.classList.add(c));
      (active ? activeClasses : inactiveClasses).forEach((c) =>
        el.classList.add(c),
      );
      // ARIA: update tab selection state
      el.setAttribute("aria-selected", active ? "true" : "false");
      el.setAttribute("tabindex", active ? "0" : "-1");
    });
  };

  // --- Labels & stats ---
  // Refresh settings summaries and daily progress counters.
  const updateLabels = () => {
    const text = getText();
    const { focus, shortBreak, longBreak } = readDurations();
    dom.focusLabel.textContent = text.summary.minutes(focus);
    dom.shortLabel.textContent = text.summary.minutes(shortBreak);
    dom.longLabel.textContent = text.summary.minutes(longBreak);
    dom.sessionCount.textContent = text.summary.session(sessionNumber);
    dom.completedCount.textContent = String(completedSessions);
    dom.totalFocus.textContent = text.summary.minutes(totalFocusMinutes);
  };

  // --- Progress ring visual + ARIA ---
  const updateProgressRing = () => {
    const safeDuration = Math.max(1, currentDurationSeconds);
    const progress = Math.min(
      1,
      Math.max(0, (safeDuration - remainingSeconds) / safeDuration),
    );
    const offset = RING_CIRCUMFERENCE * (1 - progress);
    dom.progressRing.style.strokeDasharray = `${RING_CIRCUMFERENCE}`;
    dom.progressRing.style.strokeDashoffset = `${offset}`;
    // ARIA: update progressbar value (0-100)
    const percent = Math.round(progress * 100);
    dom.progressRing.setAttribute("aria-valuenow", String(percent));
  };

  // --- Time display ---
  // Refresh the visible timer text, helper copy, title and ring.
  const updateTimeDisplay = () => {
    dom.timeDisplay.textContent = formatTime(remainingSeconds);
    dom.modeText.textContent = getModeText(mode, getLanguage());
    updateTitle();
    updateProgressRing();
  };

  // --- Full UI sync ---
  // Re-render all UI pieces from the current in-memory state.
  const syncUi = () => {
    applyLanguage();
    applyTheme(options.theme);
    updateTimeDisplay();
    applyModeSelection();
    updateLabels();
    dom.soundEnabledInput.checked = Boolean(options.soundEnabled);
    dom.startPauseBtn.textContent = isRunning ? getText().controls.pause : getText().controls.start;
    dom.startPauseBtn.setAttribute(
      "aria-label",
      isRunning ? getText().controls.pauseTimer : getText().controls.startTimer,
    );
    updateStatusBadge(isRunning ? "running" : "ready");
  };

  // --- State snapshot ---
  // Capture the full serializable state for localStorage.
  const snapshot = () => ({
    _schemaVersion: CURRENT_SCHEMA_VERSION,
    settings: readDurations(),
    options,
    progress: {
      mode,
      pendingMode,
      remainingSeconds,
      currentDurationSeconds,
      sessionNumber,
      completedSessions,
      totalFocusMinutes,
      isRunning,
      lastTickAt,
    },
  });

  // ============================================================
  // AUDIO
  // ============================================================
  // Lazily create or resume the audio context after a user gesture.
  const ensureAudio = async () => {
    if (!options.soundEnabled) return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioContext) audioContext = new AudioCtx();
    if (audioContext.state === "suspended") {
      try {
        await audioContext.resume();
      } catch {
        return null;
      }
    }
    return audioContext;
  };

  // Play a short completion chime using the Web Audio API.
  const playBeep = async () => {
    if (!options.soundEnabled) return;
    const ctx = await ensureAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    [880, 660, 880].forEach((freq, index) => {
      const startAt = now + index * 0.18;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, startAt);
      gain.gain.setValueAtTime(0.0001, startAt);
      gain.gain.exponentialRampToValueAtTime(0.12, startAt + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.0001, startAt + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startAt);
      osc.stop(startAt + 0.16);
    });
  };

  // ============================================================
  // NOTIFICATIONS
  // ============================================================
  // Show a desktop notification after a session completes when permission exists.
  const notifyCompletion = (completedMode) => {
    const text = getText();
    if (!("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    try {
      new Notification(text.notifications.completeTitle(completedMode), {
        body: text.notifications.body,
      });
    } catch {}
  };

  // Only ask for notification permission once per browser profile.
  const canAskNotificationPermission = () => {
    if (!("Notification" in window)) return false;
    if (Notification.permission !== "default") return false;
    return !localStorage.getItem(NOTIFICATION_PROMPT_KEY);
  };

  // Request notification permission on the first timer start.
  const requestNotificationPermissionOnce = async () => {
    if (!canAskNotificationPermission()) return;
    localStorage.setItem(NOTIFICATION_PROMPT_KEY, "1");
    try {
      await Notification.requestPermission();
    } catch {}
  };

  // ============================================================
  // TIMER CONTROL
  // ============================================================
  // Pause the timer loop and persist the stopped state.
  const stopTimer = (statusKey = "paused") => {
    clearInterval(timerId);
    timerId = null;
    isRunning = false;
    lastTickAt = null;
    dom.startPauseBtn.textContent = getText().controls.start;
    dom.startPauseBtn.setAttribute("aria-label", getText().controls.startTimer);
    updateStatusBadge(statusKey);
    saveState(snapshot());
  };

  // Advance the countdown by one second and handle session completion.
  const tick = () => {
    if (remainingSeconds > 0) {
      remainingSeconds -= 1;
      lastTickAt = Date.now();
      updateTimeDisplay();
      saveState(snapshot());
      return;
    }

    clearInterval(timerId);
    timerId = null;
    isRunning = false;
    lastTickAt = null;
    remainingSeconds = 0;

    const completedMode = mode;
    if (completedMode === "focus") {
      const { focus } = readDurations();
      completedSessions += 1;
      totalFocusMinutes += focus;
    } else {
      sessionNumber += 1;
    }

    pendingMode = getNextModeAfterCurrent({
      mode: completedMode,
      completedSessions,
      sessions: readDurations().sessions,
    });

    syncUi();
    saveState(snapshot());
    playBeep();
    notifyCompletion(getModeLabel(completedMode, getLanguage()));
    announce(
      getText().announcements.complete(getModeLabel(completedMode, getLanguage())),
    );
  };

  // Start or resume the active mode, applying any queued next mode first.
  const startTimer = async () => {
    if (isRunning) return;
    options = { ...options, soundEnabled: dom.soundEnabledInput.checked };
    await requestNotificationPermissionOnce();

    if (pendingMode) {
      mode = pendingMode;
      pendingMode = null;
      remainingSeconds = getModeDurationSeconds(mode);
      currentDurationSeconds = remainingSeconds;
    } else if (remainingSeconds <= 0 || currentDurationSeconds <= 0) {
      remainingSeconds = getModeDurationSeconds(mode);
      currentDurationSeconds = remainingSeconds;
    }

    isRunning = true;
    lastTickAt = Date.now();
    updateStatusBadge("running");
    dom.startPauseBtn.textContent = getText().controls.pause;
    dom.startPauseBtn.setAttribute("aria-label", getText().controls.pauseTimer);
    updateTimeDisplay();
    saveState(snapshot());
    timerId = setInterval(tick, 1000);
    announce(getText().announcements.started(getModeText(mode, getLanguage())));
  };

  // Return the app to the initial focus-session state.
  const resetTimer = () => {
    stopTimer("ready");
    mode = "focus";
    pendingMode = null;
    remainingSeconds = getModeDurationSeconds("focus");
    currentDurationSeconds = remainingSeconds;
    sessionNumber = 1;
    completedSessions = 0;
    totalFocusMinutes = 0;
    syncUi();
    saveState(snapshot());
    announce(getText().announcements.reset);
  };

  // ============================================================
  // SETTINGS HANDLERS
  // ============================================================
  // Apply duration changes immediately when the timer is idle.
  const handleSettingsChange = () => {
    const { focus, shortBreak, longBreak } = readDurations();
    if (!isRunning) {
      if (mode === "focus") remainingSeconds = focus * 60;
      else if (mode === "short") remainingSeconds = shortBreak * 60;
      else remainingSeconds = longBreak * 60;
      currentDurationSeconds = remainingSeconds;
    }
    updateTimeDisplay();
    updateLabels();
    saveState(snapshot());
  };

  // Persist non-duration options from the settings panel.
  const handleOptionsChange = () => {
    options = { ...options, soundEnabled: dom.soundEnabledInput.checked };
    saveState(snapshot());
  };

  // Switch between the two saved visual themes.
  const handleThemeToggle = () => {
    const nextTheme = getSafeTheme(options.theme) === "dark" ? "light" : "dark";
    options = { ...options, theme: nextTheme };
    applyTheme(nextTheme);
    applyModeSelection();
    updateStatusBadge(isRunning ? "running" : "ready");
    saveState(snapshot());
    announce(getText().theme.selected(nextTheme === "dark" ? getText().theme.dark : getText().theme.light));
  };

  // Switch between English and French UI copy.
  const handleLanguageChange = (language) => {
    const nextLanguage = getSafeLanguage(language);
    if (nextLanguage === getLanguage()) return;
    options = { ...options, language: nextLanguage };
    syncUi();
    saveState(snapshot());
    announce(getText().language[nextLanguage === "fr" ? "frSelected" : "enSelected"]);
  };

  // ============================================================
  // KEYBOARD NAVIGATION (tablist pattern)
  // ============================================================
  const modeButtons = [dom.modeFocusBtn, dom.modeShortBtn, dom.modeLongBtn];
  const modeOrder = ["focus", "short", "long"];

  dom.modeSwitcher.addEventListener("keydown", (event) => {
    const currentIndex = modeOrder.indexOf(mode);
    let nextIndex = currentIndex;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault();
        nextIndex = (currentIndex + 1) % modeOrder.length;
        break;
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault();
        nextIndex = (currentIndex - 1 + modeOrder.length) % modeOrder.length;
        break;
      case "Home":
        event.preventDefault();
        nextIndex = 0;
        break;
      case "End":
        event.preventDefault();
        nextIndex = modeOrder.length - 1;
        break;
      default:
        return;
    }

    const nextMode = modeOrder[nextIndex];
    // Simulate click on the target button
    const targetBtn = modeButtons[nextIndex];
    if (targetBtn) {
      targetBtn.click();
      targetBtn.focus();
    }
  });

  // ============================================================
  // RESTORE STATE
  // ============================================================
  const restoreState = () => {
    const state = loadState();
    setDurationInputs(state.settings);
    options = { ...defaultOptions, ...(state.options || {}) };
    mode = ["focus", "short", "long"].includes(state.progress.mode)
      ? state.progress.mode
      : "focus";
    pendingMode = ["focus", "short", "long"].includes(
      state.progress.pendingMode,
    )
      ? state.progress.pendingMode
      : null;
    remainingSeconds = Math.max(
      0,
      Number(state.progress.remainingSeconds) || getModeDurationSeconds(mode),
    );
    currentDurationSeconds = Math.max(
      1,
      Number(state.progress.currentDurationSeconds) ||
        getModeDurationSeconds(mode),
    );
    sessionNumber = Math.max(1, Number(state.progress.sessionNumber) || 1);
    completedSessions = Math.max(
      0,
      Number(state.progress.completedSessions) || 0,
    );
    totalFocusMinutes = Math.max(
      0,
      Number(state.progress.totalFocusMinutes) || 0,
    );
    isRunning = Boolean(state.progress.isRunning);
    lastTickAt = state.progress.lastTickAt || null;

    if (isRunning && lastTickAt) {
      const elapsedSeconds = Math.floor((Date.now() - lastTickAt) / 1000);
      if (elapsedSeconds > 0) {
        remainingSeconds = Math.max(0, remainingSeconds - elapsedSeconds);
        lastTickAt = Date.now();
      }
    }

    syncUi();

    if (isRunning && remainingSeconds > 0) {
      timerId = setInterval(tick, 1000);
    } else {
      isRunning = false;
      updateStatusBadge("ready");
    }
  };

  // ============================================================
  // EVENT LISTENERS
  // ============================================================
  dom.startPauseBtn.addEventListener("click", async () => {
    if (isRunning) {
      stopTimer("paused");
      announce(getText().announcements.paused);
    } else {
      await startTimer();
    }
  });

  dom.resetBtn.addEventListener("click", resetTimer);

  dom.modeSwitcher.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button || !dom.modeSwitcher.contains(button)) return;
    const nextMode = button.dataset.mode;
    if (!nextMode) return;
    stopTimer("ready");
    pendingMode = null;
    mode = nextMode;
    remainingSeconds = getModeDurationSeconds(nextMode);
    currentDurationSeconds = remainingSeconds;
    applyModeSelection();
    updateLabels();
    updateTimeDisplay();
    updateStatusBadge("ready");
    saveState(snapshot());
    announce(getText().announcements.selected(getModeLabel(mode, getLanguage())));
  });

  [dom.focusInput, dom.shortInput, dom.longInput, dom.sessionsInput].forEach(
    (input) => {
      input.addEventListener("change", handleSettingsChange);
      input.addEventListener("input", handleSettingsChange);
    },
  );

  dom.soundEnabledInput.addEventListener("change", handleOptionsChange);
  dom.themeToggleBtn.addEventListener("click", handleThemeToggle);
  dom.languageEnBtn.addEventListener("click", () => handleLanguageChange("en"));
  dom.languageFrBtn.addEventListener("click", () => handleLanguageChange("fr"));

  // ============================================================
  // INIT
  // ============================================================
  restoreState();
};

// ============================================================
// SERVICE WORKER REGISTRATION (PWA)
// ============================================================
// Register the service worker for offline cache support.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("./sw.js")
    .then((reg) => console.log("SW registered:", reg.scope))
    .catch((err) => console.error("SW registration failed:", err));
}

// Wait for DOM readiness before querying and wiring interactive elements.
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPomodoro);
} else {
  initPomodoro();
}
