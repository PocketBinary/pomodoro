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
// How long an undoable action stays reversible. Mirrors the toast drain in CSS.
const TOAST_DURATION = 6000;

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
      reset: "Reset settings",
      resetAria: "Reset settings to default",
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
      reset: "Reset stats",
      resetAria: "Reset today's statistics",
    },
    footer: {
      credits: "© 2026 Pomodoro · Created by PocketBinary",
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
      settingsReset: "Settings reset to defaults.",
      statsReset: "Today's statistics reset.",
      statsRestored: "Today's statistics restored.",
      paused: "Timer paused.",
      selected: (modeLabel) => `${modeLabel} selected.`,
      restored: (modeLabel) => `${modeLabel} resumed where you left off.`,
    },
    hints: {
      space: "start / pause",
    },
    deferred: "From the next session",
    dialogs: {
      modeTitle: "Session in progress",
      modeBody: (remaining, currentLabel, nextLabel) =>
        `${remaining} left in ${currentLabel}. Switching to ${nextLabel} ends this run — come back to ${currentLabel} and it resumes where you stopped.`,
      modeConfirm: "Switch anyway",
      modeKeep: "Keep going",
      settingsTitle: "Reset settings?",
      settingsBody:
        "Focus, break and session lengths go back to 25, 5, 15 and 4, and sound notifications turn back on.",
      settingsConfirm: "Reset settings",
      statsTitle: "Reset today's stats?",
      statsBody: (sessions, minutes) =>
        `${sessions} completed ${sessions === 1 ? "session" : "sessions"} and ${minutes} min of focus time will be cleared.`,
      statsConfirm: "Reset stats",
      cancel: "Cancel",
    },
    toast: {
      statsReset: "Today's statistics reset.",
      undo: "Undo",
    },
    stepper: {
      focus: { increase: "Increase focus minutes", decrease: "Decrease focus minutes" },
      short: { increase: "Increase short break minutes", decrease: "Decrease short break minutes" },
      long: { increase: "Increase long break minutes", decrease: "Decrease long break minutes" },
      sessions: {
        increase: "Increase sessions before long break",
        decrease: "Decrease sessions before long break",
      },
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
      reset: "Réinitialiser",
      resetAria: "Réinitialiser les réglages par défaut",
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
      reset: "Réinitialiser",
      resetAria: "Réinitialiser les statistiques d'aujourd'hui",
    },
    footer: {
      credits: "© 2026 Pomodoro · Créé par PocketBinary",
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
      settingsReset: "Réglages réinitialisés par défaut.",
      statsReset: "Statistiques du jour réinitialisées.",
      statsRestored: "Statistiques du jour rétablies.",
      paused: "Minuteur en pause.",
      selected: (modeLabel) => `${modeLabel} sélectionné.`,
      restored: (modeLabel) => `${modeLabel} reprise là où tu t'étais arrêté.`,
    },
    hints: {
      space: "démarrer / pause",
    },
    deferred: "Dès la prochaine session",
    dialogs: {
      modeTitle: "Session en cours",
      modeBody: (remaining, currentLabel, nextLabel) =>
        `Il reste ${remaining} en ${currentLabel}. Passer à ${nextLabel} met fin à cette session — reviens sur ${currentLabel} pour la reprendre là où tu t'es arrêté.`,
      modeConfirm: "Changer quand même",
      modeKeep: "Continuer",
      settingsTitle: "Réinitialiser les réglages ?",
      settingsBody:
        "Les durées de focus, de pause et le nombre de sessions reviennent à 25, 5, 15 et 4, et les notifications sonores se réactivent.",
      settingsConfirm: "Réinitialiser",
      statsTitle: "Réinitialiser les statistiques du jour ?",
      statsBody: (sessions, minutes) =>
        `${sessions} session(s) terminée(s) et ${minutes} min de focus seront effacées.`,
      statsConfirm: "Réinitialiser",
      cancel: "Annuler",
    },
    toast: {
      statsReset: "Statistiques du jour réinitialisées.",
      undo: "Rétablir",
    },
    stepper: {
      focus: {
        increase: "Augmenter les minutes de focus",
        decrease: "Diminuer les minutes de focus",
      },
      short: {
        increase: "Augmenter les minutes de pause courte",
        decrease: "Diminuer les minutes de pause courte",
      },
      long: {
        increase: "Augmenter les minutes de pause longue",
        decrease: "Diminuer les minutes de pause longue",
      },
      sessions: {
        increase: "Augmenter les sessions avant pause longue",
        decrease: "Diminuer les sessions avant pause longue",
      },
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
  resetSettingsBtn: document.getElementById("resetSettingsBtn"),
  resetSettingsLabel: document.getElementById("resetSettingsLabel"),
  focusLabel: document.getElementById("focusLabel"),
  shortLabel: document.getElementById("shortLabel"),
  longLabel: document.getElementById("longLabel"),
  focusNote: document.getElementById("focusNote"),
  shortNote: document.getElementById("shortNote"),
  longNote: document.getElementById("longNote"),
  shortcutLabel: document.getElementById("shortcutLabel"),
  steppers: Array.from(document.querySelectorAll("[data-stepper]")),
  appDialog: document.getElementById("appDialog"),
  appDialogTitle: document.getElementById("appDialogTitle"),
  appDialogText: document.getElementById("appDialogText"),
  appDialogConfirm: document.getElementById("appDialogConfirm"),
  appDialogCancel: document.getElementById("appDialogCancel"),
  appToast: document.getElementById("appToast"),
  appToastText: document.getElementById("appToastText"),
  appToastAction: document.getElementById("appToastAction"),
  appToastProgress: document.getElementById("appToastProgress"),
  todayLabel: document.getElementById("todayLabel"),
  completedSessionsLabel: document.getElementById("completedSessionsLabel"),
  totalFocusTimeLabel: document.getElementById("totalFocusTimeLabel"),
  completedCount: document.getElementById("completedCount"),
  totalFocus: document.getElementById("totalFocus"),
  resetStatsBtn: document.getElementById("resetStatsBtn"),
  resetStatsLabel: document.getElementById("resetStatsLabel"),
  footerCredits: document.getElementById("footerCredits"),
  footerQuote: document.getElementById("footerQuote"),
  githubLink: document.getElementById("githubLink"),
  githubLabel: document.getElementById("githubLabel"),
};

if (Object.values(dom).some((el) => !el)) {
  console.warn("Some Pomodoro DOM elements are missing or pending hydration.");
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
  } catch { }
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
  // A run interrupted by a mode switch, kept so it can be picked up again.
  let suspendedSession = null;

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
    dom.focusNote.textContent = text.deferred;
    dom.shortNote.textContent = text.deferred;
    dom.longNote.textContent = text.deferred;
    dom.shortcutLabel.textContent = text.hints.space;
    dom.steppers.forEach((button) => {
      const kind = String(button.dataset.stepper || "").replace("Input", "");
      const labels = text.stepper[kind];
      if (!labels) return;
      button.setAttribute(
        "aria-label",
        Number(button.dataset.step) > 0 ? labels.increase : labels.decrease,
      );
    });
    dom.settingsTitle.textContent = text.settings.title;
    dom.settingsSubtitle.textContent = text.settings.subtitle;
    dom.focusInputLabel.textContent = text.settings.focusMinutes;
    dom.shortInputLabel.textContent = text.settings.shortBreakMinutes;
    dom.longInputLabel.textContent = text.settings.longBreakMinutes;
    dom.sessionsInputLabel.textContent = text.settings.sessionsBeforeLongBreak;
    dom.soundNotificationsLabel.textContent = text.settings.soundNotifications;
    if (dom.resetSettingsLabel) dom.resetSettingsLabel.textContent = text.settings.reset;
    if (dom.resetSettingsBtn) dom.resetSettingsBtn.setAttribute("aria-label", text.settings.resetAria);
    dom.todayLabel.textContent = text.summary.today;
    dom.completedSessionsLabel.textContent = text.summary.completedFocusSessions;
    dom.totalFocusTimeLabel.textContent = text.summary.totalFocusTime;
    if (dom.resetStatsLabel) dom.resetStatsLabel.textContent = text.summary.reset;
    if (dom.resetStatsBtn) dom.resetStatsBtn.setAttribute("aria-label", text.summary.resetAria);
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

  // A duration edited mid-session cannot be applied yet, so the recap card says so
  // instead of showing a figure the dial contradicts.
  const isDeferredDuration = (targetMode, configuredSeconds) =>
    targetMode === mode &&
    remainingSeconds !== currentDurationSeconds &&
    configuredSeconds !== currentDurationSeconds;

  const updateDeferredMarkers = ({ focus, shortBreak, longBreak }) => {
    dom.focusNote.hidden = !isDeferredDuration("focus", focus * 60);
    dom.shortNote.hidden = !isDeferredDuration("short", shortBreak * 60);
    dom.longNote.hidden = !isDeferredDuration("long", longBreak * 60);
  };

  // Disable a stepper once it has reached the bound of its field.
  const updateStepperBounds = () => {
    dom.steppers.forEach((button) => {
      const input = dom[button.dataset.stepper];
      if (!input) return;
      const step = Number(button.dataset.step) || 1;
      const value = Number(input.value);
      button.disabled = step > 0 ? value >= Number(input.max) : value <= Number(input.min);
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
    updateDeferredMarkers({ focus, shortBreak, longBreak });
    updateStepperBounds();
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
    } catch { }
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
    } catch { }
  };

  // ============================================================
  // CONFIRMATION DIALOG
  // ============================================================
  // Resolve true only when the user takes the destructive branch.
  const askConfirm = ({ title, body, confirmLabel, safeLabel }) =>
    new Promise((resolve) => {
      dom.appDialogTitle.textContent = title;
      dom.appDialogText.textContent = body;
      dom.appDialogConfirm.textContent = confirmLabel;
      dom.appDialogCancel.textContent = safeLabel || getText().dialogs.cancel;
      dom.appDialog.returnValue = "cancel";
      const handleClose = () => {
        dom.appDialog.removeEventListener("close", handleClose);
        resolve(dom.appDialog.returnValue === "confirm");
      };
      dom.appDialog.addEventListener("close", handleClose);
      dom.appDialog.showModal();
      // Focus the safe branch: the risky one is never the default.
      dom.appDialogCancel.focus();
    });

  // ============================================================
  // UNDO TOAST
  // ============================================================
  let toastTimeout = null;
  let toastDeadline = 0;
  let toastRemaining = 0;
  let toastUndo = null;

  const hideToast = () => {
    window.clearTimeout(toastTimeout);
    toastTimeout = null;
    toastRemaining = 0;
    toastUndo = null;
    dom.appToast.hidden = true;
    dom.appToast.classList.remove("app-toast--counting", "app-toast--paused");
  };

  const pauseToast = () => {
    if (dom.appToast.hidden || !toastTimeout) return;
    window.clearTimeout(toastTimeout);
    toastTimeout = null;
    toastRemaining = Math.max(0, toastDeadline - Date.now());
    dom.appToast.classList.add("app-toast--paused");
  };

  const resumeToast = () => {
    if (dom.appToast.hidden || toastTimeout || toastRemaining <= 0) return;
    dom.appToast.classList.remove("app-toast--paused");
    toastDeadline = Date.now() + toastRemaining;
    toastTimeout = window.setTimeout(hideToast, toastRemaining);
  };

  const showToast = (message, undo) => {
    window.clearTimeout(toastTimeout);
    dom.appToastText.textContent = message;
    toastUndo = undo ? undo.onUndo : null;
    dom.appToastAction.hidden = !undo;
    if (undo) dom.appToastAction.textContent = undo.label;
    dom.appToast.hidden = false;
    dom.appToastProgress.style.animationDuration = `${TOAST_DURATION}ms`;
    dom.appToast.classList.remove("app-toast--paused", "app-toast--counting");
    void dom.appToast.offsetWidth; // restart the draining rule
    dom.appToast.classList.add("app-toast--counting");
    toastDeadline = Date.now() + TOAST_DURATION;
    toastRemaining = 0;
    toastTimeout = window.setTimeout(hideToast, TOAST_DURATION);
  };

  dom.appDialogConfirm.addEventListener("click", () => dom.appDialog.close("confirm"));
  dom.appDialogCancel.addEventListener("click", () => dom.appDialog.close("cancel"));

  dom.appToastAction.addEventListener("click", () => {
    const undo = toastUndo;
    hideToast();
    if (undo) undo();
  });
  dom.appToast.addEventListener("mouseenter", pauseToast);
  dom.appToast.addEventListener("mouseleave", resumeToast);
  dom.appToast.addEventListener("focusin", pauseToast);
  dom.appToast.addEventListener("focusout", resumeToast);

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

    const nextMode = getNextModeAfterCurrent({
      mode: completedMode,
      completedSessions,
      sessions: readDurations().sessions,
    });
    mode = nextMode;
    pendingMode = null;
    suspendedSession = null;
    remainingSeconds = getModeDurationSeconds(mode);
    currentDurationSeconds = remainingSeconds;

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
      applyModeSelection();
      updateLabels();
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

  // Reset only the current countdown timer to its initial duration without altering mode or session stats.
  const resetTimer = () => {
    stopTimer("ready");
    pendingMode = null;
    suspendedSession = null;
    remainingSeconds = getModeDurationSeconds(mode);
    currentDurationSeconds = remainingSeconds;
    updateTimeDisplay();
    saveState(snapshot());
    announce(getText().announcements.reset);
  };

  // ============================================================
  // SETTINGS HANDLERS
  // ============================================================
  // Apply duration changes immediately when the timer is idle.
  const handleSettingsChange = () => {
    const { focus, shortBreak, longBreak } = readDurations();
    if (!isRunning && remainingSeconds === currentDurationSeconds) {
      if (mode === "focus") remainingSeconds = focus * 60;
      else if (mode === "short") remainingSeconds = shortBreak * 60;
      else remainingSeconds = longBreak * 60;
      currentDurationSeconds = remainingSeconds;
    }
    updateTimeDisplay();
    updateLabels();
    saveState(snapshot());
  };

  // Commit a duration edit: clamp it, re-render, persist, and let the break
  // media resync. Called on blur, on Enter and on stepper clicks — never per keystroke.
  const commitDurations = () => {
    handleSettingsChange();
    [dom.shortInput, dom.longInput].forEach((input) => {
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
  };

  // Reset all settings (durations + sound) back to default values.
  const resetSettings = async () => {
    const proceed = await askConfirm({
      title: getText().dialogs.settingsTitle,
      body: getText().dialogs.settingsBody,
      confirmLabel: getText().dialogs.settingsConfirm,
    });
    if (!proceed) return;
    dom.focusInput.value = "25";
    dom.shortInput.value = "5";
    dom.longInput.value = "15";
    dom.sessionsInput.value = "4";
    dom.soundEnabledInput.checked = true;
    options = { ...options, soundEnabled: true };
    commitDurations();
    announce(getText().announcements.settingsReset);
  };

  // Reset today's counters, keeping a snapshot so the action stays reversible.
  const resetStats = async () => {
    const previous = { completedSessions, totalFocusMinutes, sessionNumber };
    const proceed = await askConfirm({
      title: getText().dialogs.statsTitle,
      body: getText().dialogs.statsBody(completedSessions, totalFocusMinutes),
      confirmLabel: getText().dialogs.statsConfirm,
    });
    if (!proceed) return;
    completedSessions = 0;
    totalFocusMinutes = 0;
    sessionNumber = 1;
    updateLabels();
    saveState(snapshot());
    announce(getText().announcements.statsReset);
    showToast(getText().toast.statsReset, {
      label: getText().toast.undo,
      onUndo: () => {
        completedSessions = previous.completedSessions;
        totalFocusMinutes = previous.totalFocusMinutes;
        sessionNumber = previous.sessionNumber;
        updateLabels();
        saveState(snapshot());
        announce(getText().announcements.statsRestored);
      },
    });
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
  if (dom.resetSettingsBtn) dom.resetSettingsBtn.addEventListener("click", resetSettings);
  if (dom.resetStatsBtn) dom.resetStatsBtn.addEventListener("click", resetStats);

  dom.modeSwitcher.addEventListener("click", async (event) => {
    const button = event.target.closest("button");
    if (!button || !dom.modeSwitcher.contains(button)) return;
    const nextMode = button.dataset.mode;
    if (!nextMode || nextMode === mode) return;

    // Switching mid-run throws the remaining time away: ask first, keep the
    // interrupted run so coming back to that mode resumes it.
    if (isRunning) {
      const interrupted = { mode, remainingSeconds, currentDurationSeconds };
      const proceed = await askConfirm({
        title: getText().dialogs.modeTitle,
        body: getText().dialogs.modeBody(
          formatTime(interrupted.remainingSeconds),
          getModeLabel(interrupted.mode, getLanguage()),
          getModeLabel(nextMode, getLanguage()),
        ),
        confirmLabel: getText().dialogs.modeConfirm,
        safeLabel: getText().dialogs.modeKeep,
      });
      if (!proceed) {
        applyModeSelection();
        button.blur();
        return;
      }
      suspendedSession = interrupted;
    }

    stopTimer("ready");
    pendingMode = null;
    mode = nextMode;

    const resumable = suspendedSession && suspendedSession.mode === nextMode;
    if (resumable) {
      remainingSeconds = suspendedSession.remainingSeconds;
      currentDurationSeconds = suspendedSession.currentDurationSeconds;
      suspendedSession = null;
    } else {
      remainingSeconds = getModeDurationSeconds(nextMode);
      currentDurationSeconds = remainingSeconds;
    }

    applyModeSelection();
    updateLabels();
    updateTimeDisplay();
    updateStatusBadge("ready");
    saveState(snapshot());
    announce(
      resumable
        ? getText().announcements.restored(getModeLabel(mode, getLanguage()))
        : getText().announcements.selected(getModeLabel(mode, getLanguage())),
    );
  });

  [dom.focusInput, dom.shortInput, dom.longInput, dom.sessionsInput].forEach((input) => {
    // Commit on blur or Enter only: clamping mid-keystroke fights the typist.
    input.addEventListener("change", commitDurations);
    input.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      commitDurations();
      input.blur();
    });
  });

  dom.steppers.forEach((button) => {
    button.addEventListener("click", () => {
      const input = dom[button.dataset.stepper];
      if (!input) return;
      const step = Number(button.dataset.step) || 1;
      const min = Number(input.min);
      const max = Number(input.max);
      const current = clampValue(Number(input.value) || min, min, max);
      const next = clampValue(current + step, min, max);
      if (next === current) return;
      input.value = String(next);
      commitDurations();
    });
  });

  dom.soundEnabledInput.addEventListener("change", handleOptionsChange);
  dom.themeToggleBtn.addEventListener("click", handleThemeToggle);
  dom.languageEnBtn.addEventListener("click", () => handleLanguageChange("en"));
  dom.languageFrBtn.addEventListener("click", () => handleLanguageChange("fr"));

  // Space toggles start/pause from anywhere that is not already a control,
  // so it never fights a button, field or the dialog.
  document.addEventListener("keydown", (event) => {
    if (event.key !== " " && event.code !== "Space") return;
    if (event.repeat) return;
    if (dom.appDialog && dom.appDialog.open) return;
    const target = event.target instanceof Element ? event.target : null;
    if (target && target.closest("input, textarea, select, button, a[href], [contenteditable='true']")) return;
    event.preventDefault();
    dom.startPauseBtn.click();
  });

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
