/**
 * ============================================================================
 * MODULE PRINCIPAL : MINUTEUR POMODORO (js/app.js)
 * ============================================================================
 * 
 * Application PWA moderne de concentration Pomodoro écrite en JavaScript Vanilla pur.
 * 
 * Architecture et responsabilités :
 * 1. MOTEUR DU MINUTEUR :
 *    - Gestion des 3 modes : Focus (Travail), Pause courte, Pause longue.
 *    - Calcul temporel à la seconde avec gestion des sauts et de la reprise après veille.
 *    - Cycles configurables (nombre de sessions focus avant une pause longue).
 * 
 * 2. PERSISTANCE ET RÉSILIENCE :
 *    - Sauvegarde automatique dans le localStorage avec schéma versionné (v10).
 *    - Validation et assainissement strict des types à la désérialisation.
 *    - Récupération transparente en cas de crash ou de rechargement de page.
 * 
 * 3. RETOURS SENSORIELS (AUDIO & NOTIFICATIONS) :
 *    - Synthèse sonore native via l'API Web Audio (aucun fichier son externe requis).
 *    - Notifications de bureau via l'API Notifications du navigateur.
 * 
 * 4. ACCESSIBILITÉ WCAG 2.1 AA :
 *    - Navigation complète au clavier (pattern tablist ARIA, raccourci Espace).
 *    - Annonces vocales pour les technologies d'assistance (zone aria-live).
 *    - Indicateur visuel circulaire SVG (balise progressbar avec aria-valuenow).
 *    - Dialogues modaux accessibles avec capture de focus (<dialog>).
 *    - Toasts informatifs avec action d'annulation réversible.
 * 
 * 5. PERSONNALISATION :
 *    - Thèmes clair et sombre persistés.
 *    - Bilinguisme natif Français / Anglais sans rechargement de page.
 *    - Adaptation ergonomique paysage pour tablettes.
 * ============================================================================
 */

// ============================================================================
// 1. CONSTANTES GLOBALES DE CONFIGURATION
// ============================================================================

/** Clé de stockage principal dans le localStorage (versionnée pour éviter les conflits) */
const STORAGE_KEY = "pomodoro-app-state-v10";

/** Clé de suivi pour ne demander l'autorisation de notification qu'une seule fois */
const NOTIFICATION_PROMPT_KEY = "pomodoro-notification-prompted-v1";

/** Titre de base de l'application affiché dans l'onglet du navigateur */
const TITLE_BASE = "Pomodoro";

/** Rayon du cercle SVG de progression (en pixels) */
const RING_RADIUS = 150;

/** Circonférence totale du cercle SVG pour le calcul de l'attribut stroke-dashoffset */
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/** Numéro de version du schéma de données sauvegardé */
const CURRENT_SCHEMA_VERSION = 1;

/** Liste des thèmes visuels pris en charge */
const THEME_VALUES = ["light", "dark"];

/** Liste des codes de langues supportées */
const LANGUAGE_VALUES = ["en", "fr"];

/** Durée d'affichage du toast d'annulation (en millisecondes) */
const TOAST_DURATION = 6000;

/** Options par défaut appliquées lors de la toute première visite */
const defaultOptions = {
  soundEnabled: true,
  theme: "light",
  language: "en"
};

// ============================================================================
// 2. DICTIONNAIRES D'INTERNATIONALISATION (I18N)
// ============================================================================

const copy = {
  // Dictionnaire de langue anglaise
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
      today: "Today",
      completedFocusSessions: "Completed focus sessions",
      totalFocusTime: "Total focus time",
      cyclePosition: (position, total) => `Focus ${position} of ${total} in this cycle`,
      minutes: (number) => `${number} min`,
      reset: "Reset stats",
      resetAria: "Reset today's statistics",
    },
    tabletHint: "For an optimal tablet experience, please switch to landscape mode.",
    footer: {
      credits: "© 2026 Pomodoro · Created by PocketBinary",
      quote: "Works offline. No account needed.",
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
      selected: (modeLabel) => `${modeLabel} mode selected.`,
      restored: (modeLabel) => `Resumed previous ${modeLabel} timer.`,
    },
    hints: {
      space: "start / pause",
    },
    dialogs: {
      modeTitle: "Switch timer mode?",
      modeBody: (remaining, currentMode, nextMode) =>
        `You have ${remaining} left in your ${currentMode} session. If you switch to ${nextMode}, this run will pause so you can return to it later.`,
      modeConfirm: "Switch mode",
      modeKeep: "Keep going",
      settingsTitle: "Reset settings to defaults?",
      settingsBody:
        "Durations will return to 25 min focus, 5 min short break, 15 min long break, and 4 sessions before a long break.",
      settingsConfirm: "Reset to defaults",
      statsTitle: "Reset today's statistics?",
      statsBody: (sessions, minutes) =>
        `This will clear ${sessions} completed session(s) and ${minutes} minute(s) of focus time for today.`,
      statsConfirm: "Reset stats",
      cancel: "Cancel",
    },
    toast: {
      statsReset: "Today's stats reset.",
      undo: "Undo",
    },
    deferred: "From the next session",
    stepper: {
      focus: {
        increase: "Increase focus minutes",
        decrease: "Decrease focus minutes",
      },
      short: {
        increase: "Increase short break minutes",
        decrease: "Decrease short break minutes",
      },
      long: {
        increase: "Increase long break minutes",
        decrease: "Decrease long break minutes",
      },
      sessions: {
        increase: "Increase sessions before long break",
        decrease: "Decrease sessions before long break",
      },
    },
  },

  // Dictionnaire de langue française
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
      today: "Aujourd'hui",
      completedFocusSessions: "Sessions de focus terminées",
      totalFocusTime: "Temps total de focus",
      cyclePosition: (position, total) => `Focus ${position} sur ${total} dans ce cycle`,
      minutes: (number) => `${number} min`,
      reset: "Réinitialiser",
      resetAria: "Réinitialiser les statistiques d'aujourd'hui",
    },
    tabletHint: "Pour un confort optimal sur tablette, basculez en mode paysage.",
    footer: {
      credits: "© 2026 Pomodoro · Créé par PocketBinary",
      quote: "Fonctionne hors ligne. Sans compte.",
      github: "GitHub",
      githubAria: "Voir le dépôt Pomodoro sur GitHub",
    },
    notifications: {
      body: "Appuie sur Démarrer quand tu es prêt pour la prochaine session.",
      completeTitle: (modeLabel) => `Pomodoro · ${modeLabel} terminé`,
    },
    announcements: {
      complete: (modeLabel) => `${modeLabel} terminé. Appuie sur Démarrer pour continuer.`,
      started: (modeText) => `Minuteur ${modeText.toLowerCase()} démarré.`,
      reset: "Minuteur réinitialisé.",
      settingsReset: "Réglages réinitialisés aux valeurs par défaut.",
      statsReset: "Statistiques d'aujourd'hui réinitialisées.",
      statsRestored: "Statistiques d'aujourd'hui restaurées.",
      paused: "Minuteur en pause.",
      selected: (modeLabel) => `Mode ${modeLabel.toLowerCase()} sélectionné.`,
      restored: (modeLabel) => `Minuteur précédent ${modeLabel.toLowerCase()} repris.`,
    },
    hints: {
      space: "démarrer / pause",
    },
    dialogs: {
      modeTitle: "Changer de mode ?",
      modeBody: (remaining, currentMode, nextMode) =>
        `Il te reste ${remaining} dans ta session de ${currentMode.toLowerCase()}. Si tu passes à ${nextMode.toLowerCase()}, ce décompte se mettra en pause pour que tu puisses y revenir plus tard.`,
      modeConfirm: "Changer de mode",
      modeKeep: "Continuer la session",
      settingsTitle: "Rétablir les réglages par défaut ?",
      settingsBody:
        "Les durées reviendront à 25 min de focus, 5 min de pause courte, 15 min de pause longue et 4 sessions avant pause longue.",
      settingsConfirm: "Rétablir par défaut",
      statsTitle: "Réinitialiser les statistiques d'aujourd'hui ?",
      statsBody: (sessions, minutes) =>
        `Cette action effacera ${sessions} session(s) terminée(s) et ${minutes} minute(s) de concentration pour aujourd'hui.`,
      statsConfirm: "Réinitialiser les stats",
      cancel: "Annuler",
    },
    toast: {
      statsReset: "Statistiques d'aujourd'hui réinitialisées.",
      undo: "Annuler",
    },
    deferred: "À partir de la prochaine session",
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

// ============================================================================
// 3. UTILITAIRES ET ÉTAT INITIAL
// ============================================================================

/**
 * Construit un objet d'état par défaut vierge, utilisé lors de la première
 * visite ou si les données sauvegardées sont corrompues.
 */
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

/**
 * Restreint une valeur numérique dans une plage définie [min, max].
 */
const clampValue = (value, min, max) => Math.min(Math.max(value, min), max);

/**
 * Convertit un nombre total de secondes en chaîne formattée "mm:ss".
 * @param {number} totalSeconds
 * @returns {string} Ex: "25:00"
 */
const formatTime = (totalSeconds) => {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

/**
 * Retourne le libellé localisé d'un mode de minuteur (ex: "Focus", "Pause courte").
 */
const getModeLabel = (mode = "focus", language = "en") => {
  const safeLanguage = getSafeLanguage(language);
  return copy[safeLanguage].modes[mode] || copy[safeLanguage].modes.focus;
};

/**
 * Retourne le texte d'encouragement affiché sous le minuteur selon le mode.
 */
const getModeText = (mode = "focus", language = "en") => {
  const safeLanguage = getSafeLanguage(language);
  return copy[safeLanguage].modeText[mode] || copy[safeLanguage].modeText.focus;
};

/**
 * Garantit que la valeur du thème est strictement "light" ou "dark".
 */
const getSafeTheme = (theme) => (THEME_VALUES.includes(theme) ? theme : "light");

/**
 * Garantit que la langue est strictement "en" ou "fr".
 */
const getSafeLanguage = (language) => (LANGUAGE_VALUES.includes(language) ? language : "en");

// ============================================================================
// 4. RÉFÉRENCES AUX ÉLÉMENTS DU DOM
// ============================================================================

const dom = {
  skipLink: document.getElementById("skipLink"),
  tabletHint: document.getElementById("tabletHint"),
  tabletHintText: document.getElementById("tabletHintText"),
  timeDisplay: document.getElementById("timeDisplay"),
  modeText: document.getElementById("modeText"),
  srAnnouncement: document.getElementById("srAnnouncement"),
  progressRing: document.getElementById("progressRing"),
  timerDisplay: document.getElementById("timer-display"),
  cyclePosition: document.getElementById("cyclePosition"),
  cycleDots: document.getElementById("cycleDots"),
  cycleValue: document.getElementById("cycleValue"),
  startPauseBtn: document.getElementById("startPauseBtn"),
  resetBtn: document.getElementById("resetBtn"),
  themeToggleBtn: document.getElementById("themeToggleBtn"),
  languageEnBtn: document.getElementById("languageEnBtn"),
  languageFrBtn: document.getElementById("languageFrBtn"),
  modeSwitcher: document.getElementById("modeSwitcher"),
  modeFocusBtn: document.getElementById("modeFocusBtn"),
  modeShortBtn: document.getElementById("modeShortBtn"),
  modeLongBtn: document.getElementById("modeLongBtn"),
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
  console.warn("Certains éléments du DOM Pomodoro sont absents ou en attente d'hydratation.");
}

// ============================================================================
// 5. VALIDATION STRICTE DE L'ÉTAT LOCAL (SÉCURITÉ LOCALSTORAGE)
// ============================================================================

/**
 * Valide l'intégrité de la structure JSON extraite du localStorage.
 * Si le schéma ou les types ne correspondent pas, retourne null pour forcer
 * la réinitialisation propre vers les valeurs par défaut saines.
 */
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
  if (options.language !== undefined && !validLanguage(options.language)) return null;
  if (!validMode(progress.mode)) return null;
  if (!isStrOrNull(progress.pendingMode)) return null;
  if (progress.pendingMode !== null && !validMode(progress.pendingMode)) return null;
  if (!isFiniteNum(progress.remainingSeconds)) return null;
  if (!isFiniteNum(progress.currentDurationSeconds)) return null;
  if (!isFiniteNum(progress.sessionNumber)) return null;
  if (!isFiniteNum(progress.completedSessions)) return null;
  if (!isFiniteNum(progress.totalFocusMinutes)) return null;
  if (!isBool(progress.isRunning)) return null;
  if (progress.lastTickAt !== null && !isFiniteNum(Number(progress.lastTickAt))) return null;

  return parsed;
};

// ============================================================================
// 6. GESTION DES RÉGLAGES DE DURÉE
// ============================================================================

/**
 * Lit, valide et borne toutes les valeurs numériques des champs de réglages.
 */
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

/**
 * Remplit les champs de saisie des réglages à partir d'un objet de paramètres.
 */
const setDurationInputs = (settings) => {
  dom.focusInput.value = clampValue(Number(settings.focus) || 25, 1, 120);
  dom.shortInput.value = clampValue(Number(settings.shortBreak) || 5, 1, 60);
  dom.longInput.value = clampValue(Number(settings.longBreak) || 15, 1, 60);
  dom.sessionsInput.value = clampValue(Number(settings.sessions) || 4, 1, 20);
};

/**
 * Calcule la durée totale en secondes pour un mode donné d'après les réglages.
 */
const getModeDurationSeconds = (mode) => {
  const { focus, shortBreak, longBreak } = readDurations();
  if (mode === "focus") return focus * 60;
  if (mode === "short") return shortBreak * 60;
  return longBreak * 60;
};

/**
 * Détermine quel est le mode suivant une fois la session active terminée :
 * - Après une pause (courte ou longue) -> toujours retour au mode Focus.
 * - Après un bloc Focus -> pause longue si le cycle est atteint, sinon pause courte.
 */
const getNextModeAfterCurrent = ({ mode, completedSessions, sessions }) => {
  if (mode === "focus") {
    const nextCompleted = completedSessions + 1;
    return nextCompleted % sessions === 0 ? "long" : "short";
  }
  return "focus";
};

// ============================================================================
// 7. PERSISTANCE LOCALSTORAGE
// ============================================================================

/**
 * Charge l'état persisté depuis le localStorage avec repli sécurisé.
 */
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

/**
 * Écrit l'état complet dans le localStorage sans générer d'exception bloquante.
 */
const saveState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { }
};

// ============================================================================
// 8. COEUR APPLICATIF : MINUTEUR, AUDIO, THÈME, INTERFACE
// ============================================================================

const initPomodoro = () => {
  // Variables d'état en mémoire
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
  let suspendedSession = null;

  const getLanguage = () => getSafeLanguage(options.language);
  const getText = () => copy[getLanguage()];

  /**
   * Diffuse un message vocal pour les lecteurs d'écran via la zone aria-live.
   */
  const announce = (message) => {
    dom.srAnnouncement.textContent = "";
    window.setTimeout(() => {
      dom.srAnnouncement.textContent = message;
    }, 10);
  };

  /**
   * Met à jour le titre de l'onglet du navigateur avec le compte à rebours dynamique.
   */
  const updateTitle = () => {
    document.title = `${formatTime(remainingSeconds)} · ${getModeLabel(mode, getLanguage())} · ${TITLE_BASE}`;
  };

  /**
   * Met à jour le badge visuel d'état ("Prêt", "En cours", "En pause").
   */
  const publishRunState = (statusKey = "ready") => {
    // The primary button already says Start / Pause: the state lives on the body
    // so the break-media module can read it without a second visible badge.
    document.body.dataset.runstate = statusKey;
  };

  /**
   * Applique le thème visuel (clair ou sombre) sur les éléments du DOM.
   */
  const applyTheme = (theme) => {
    const text = getText();
    const safeTheme = getSafeTheme(theme);
    document.body.dataset.theme = safeTheme;
    document.documentElement.dataset.theme = safeTheme;
    document.documentElement.style.colorScheme = safeTheme;
    dom.themeToggleBtn.setAttribute("aria-checked", safeTheme === "dark" ? "true" : "false");
    dom.themeToggleBtn.setAttribute(
      "aria-label",
      safeTheme === "dark" ? text.theme.switchToLight : text.theme.switchToDark,
    );
    document.querySelectorAll('meta[name="theme-color"]').forEach((themeColor) => {
      themeColor.setAttribute("content", safeTheme === "dark" ? "#0B1120" : "#F5F6F8");
    });
  };

  /**
   * Applique toutes les chaînes de texte localisées selon la langue sélectionnée.
   */
  const applyLanguage = () => {
    const language = getLanguage();
    const text = getText();
    document.documentElement.lang = language;
    dom.languageEnBtn.setAttribute("aria-pressed", language === "en" ? "true" : "false");
    dom.languageFrBtn.setAttribute("aria-pressed", language === "fr" ? "true" : "false");
    dom.languageEnBtn.parentElement.setAttribute("aria-label", text.language.group);

    dom.skipLink.textContent = text.skipLink;
    if (dom.tabletHintText) dom.tabletHintText.textContent = text.tabletHint;
    dom.modeSwitcher.setAttribute("aria-label", text.timerModesAria);
    dom.timerDisplay.setAttribute("aria-label", text.timerDisplayAria);
    dom.progressRing.setAttribute("aria-label", text.progressAria);
    dom.modeFocusBtn.textContent = text.modes.focus;
    dom.modeShortBtn.textContent = text.modes.short;
    dom.modeLongBtn.textContent = text.modes.long;
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

  /**
   * Met à jour les classes visuelles et les attributs ARIA des onglets de mode.
   */
  const applyModeSelection = () => {
    const buttons = [
      { el: dom.modeFocusBtn, targetMode: "focus" },
      { el: dom.modeShortBtn, targetMode: "short" },
      { el: dom.modeLongBtn, targetMode: "long" },
    ];

    const baseClasses = ["rounded-full", "px-4", "py-1", "text-sm", "font-semibold", "transition"];
    const inactiveClasses = ["text-slate-500", "hover:text-slate-900"];
    const activeClasses = ["bg-slate-900", "text-white"];

    buttons.forEach(({ el, targetMode }) => {
      const active = mode === targetMode;
      el.className = "";
      baseClasses.forEach((c) => el.classList.add(c));
      (active ? activeClasses : inactiveClasses).forEach((c) => el.classList.add(c));
      el.setAttribute("aria-selected", active ? "true" : "false");
      el.setAttribute("tabindex", active ? "0" : "-1");
    });

    // Drives the focus / break register of the whole card, in CSS only
    document.body.dataset.mode = mode;
  };

  /**
   * Indique si une durée a été modifiée en cours de route et s'appliquera au prochain tour.
   */
  const isDeferredDuration = (targetMode, configuredSeconds) =>
    targetMode === mode &&
    remainingSeconds !== currentDurationSeconds &&
    configuredSeconds !== currentDurationSeconds;

  const updateDeferredMarkers = ({ focus, shortBreak, longBreak }) => {
    dom.focusNote.hidden = !isDeferredDuration("focus", focus * 60);
    dom.shortNote.hidden = !isDeferredDuration("short", shortBreak * 60);
    dom.longNote.hidden = !isDeferredDuration("long", longBreak * 60);
  };

  /**
   * Désactive les boutons steppers (−/+) lorsqu'une limite min ou max est atteinte.
   */
  const updateStepperBounds = () => {
    dom.steppers.forEach((button) => {
      const input = dom[button.dataset.stepper];
      if (!input) return;
      const step = Number(button.dataset.step) || 1;
      const value = Number(input.value);
      input.setAttribute("aria-valuenow", String(value));
      button.disabled = step > 0 ? value >= Number(input.max) : value <= Number(input.min);
    });
  };

  /**
   * Rafraîchit les synthèses chiffrées (durées et compteurs statistiques).
   */
  const renderCycle = () => {
    const text = getText();
    const { sessions } = readDurations();
    const total = Math.max(1, sessions);
    // Derived from the day counter, so the markers can never disagree with "Today"
    const done = ((completedSessions % total) + total) % total;
    const inBreak = mode !== "focus";
    // A break sits on the session it just finished; focus sits on the next one
    const position = inBreak
      ? done === 0 && completedSessions > 0 ? total : Math.max(1, done)
      : Math.min(done + 1, total);
    const filled = inBreak ? position : done;

    dom.cycleDots.replaceChildren();
    for (let i = 0; i < total; i += 1) {
      const dot = document.createElement("span");
      dot.className = "cycle__dot";
      if (i < filled) dot.classList.add("is-done");
      else if (!inBreak && i === position - 1) dot.classList.add("is-current");
      dom.cycleDots.append(dot);
    }
    dom.cycleValue.textContent = `${position} / ${total}`;
    dom.cyclePosition.setAttribute("aria-label", text.summary.cyclePosition(position, total));
  };

  const updateLabels = () => {
    const text = getText();
    const { focus, shortBreak, longBreak } = readDurations();
    dom.completedCount.textContent = String(completedSessions);
    dom.totalFocus.textContent = text.summary.minutes(totalFocusMinutes);
    renderCycle();
    updateDeferredMarkers({ focus, shortBreak, longBreak });
    updateStepperBounds();
  };

  /**
   * Anime l'anneau circulaire SVG selon le pourcentage de temps écoulé.
   */
  const updateProgressRing = () => {
    const safeDuration = Math.max(1, currentDurationSeconds);
    const progress = Math.min(1, Math.max(0, (safeDuration - remainingSeconds) / safeDuration));
    const offset = RING_CIRCUMFERENCE * (1 - progress);
    dom.progressRing.style.strokeDasharray = `${RING_CIRCUMFERENCE}`;
    dom.progressRing.style.strokeDashoffset = `${offset}`;
    const percent = Math.round(progress * 100);
    // Round caps paint a stray dot at 0 %: keep the arc hidden until it is real
    dom.progressRing.style.opacity = percent > 0 ? "1" : "0";
    dom.progressRing.setAttribute("aria-valuenow", String(percent));
  };

  /**
   * Rafraîchit l'affichage temporel chiffré ("mm:ss"), le titre et l'anneau.
   */
  const updateTimeDisplay = () => {
    dom.timeDisplay.textContent = formatTime(remainingSeconds);
    // The dial names its phase literally: no motivational second label
    dom.modeText.textContent = getModeLabel(mode, getLanguage());
    updateTitle();
    updateProgressRing();
  };

  /**
   * Synchronise l'intégralité de l'interface utilisateur d'après l'état en mémoire.
   */
  const syncUi = () => {
    applyLanguage();
    applyTheme(options.theme);
    updateTimeDisplay();
    applyModeSelection();
    updateLabels();
    dom.soundEnabledInput.checked = Boolean(options.soundEnabled);
    dom.soundEnabledInput.setAttribute("aria-checked", options.soundEnabled ? "true" : "false");
    dom.startPauseBtn.textContent = isRunning ? getText().controls.pause : getText().controls.start;
    dom.startPauseBtn.setAttribute(
      "aria-label",
      isRunning ? getText().controls.pauseTimer : getText().controls.startTimer,
    );
    publishRunState(isRunning ? "running" : "ready");
  };

  /**
   * Crée un instantané sérialisable de l'état pour la persistance locale.
   */
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

  // --- Audio natif (Web Audio API) ---
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

  /**
   * Joue un carillon doux et harmonieux de fin de session via des oscillateurs sinusoïdaux.
   */
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

  // --- Notifications de bureau ---
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

  const canAskNotificationPermission = () => {
    if (!("Notification" in window)) return false;
    if (Notification.permission !== "default") return false;
    return !localStorage.getItem(NOTIFICATION_PROMPT_KEY);
  };

  const requestNotificationPermissionOnce = async () => {
    if (!canAskNotificationPermission()) return;
    localStorage.setItem(NOTIFICATION_PROMPT_KEY, "1");
    try {
      await Notification.requestPermission();
    } catch { }
  };

  // --- Boîte de dialogue de confirmation accessible (<dialog>) ---
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
      dom.appDialogCancel.focus();
    });

  // --- Notifications Toast avec bouton d'annulation (Undo) ---
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
    void dom.appToast.offsetWidth;
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

  // --- Contrôle du décompte temporel ---
  const stopTimer = (statusKey = "paused") => {
    clearInterval(timerId);
    timerId = null;
    isRunning = false;
    lastTickAt = null;
    dom.startPauseBtn.textContent = getText().controls.start;
    dom.startPauseBtn.setAttribute("aria-label", getText().controls.startTimer);
    publishRunState(statusKey);
    saveState(snapshot());
  };

  /**
   * Avance le compte à rebours d'une seconde et gère la transition de mode à l'échéance.
   */
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
      // After the long break the cycle starts over, so the position resets with it
      sessionNumber = completedMode === "long" ? 1 : sessionNumber + 1;
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
    announce(getText().announcements.complete(getModeLabel(completedMode, getLanguage())));
  };

  /**
   * Démarre ou reprend le décompte du mode actif.
   */
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
    publishRunState("running");
    dom.startPauseBtn.textContent = getText().controls.pause;
    dom.startPauseBtn.setAttribute("aria-label", getText().controls.pauseTimer);
    updateTimeDisplay();
    saveState(snapshot());
    timerId = setInterval(tick, 1000);
    announce(getText().announcements.started(getModeText(mode, getLanguage())));
  };

  /**
   * Réinitialise uniquement le chrono en cours sans affecter les statistiques du jour ni les modes.
   */
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

  // --- Gestionnaires des paramètres et réinitialisations ---
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

  const commitDurations = () => {
    handleSettingsChange();
    [dom.shortInput, dom.longInput].forEach((input) => {
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
  };

  /**
   * Réinitialise les paramètres (durées et son) aux valeurs d'usine après confirmation.
   */
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

  /**
   * Réinitialise les statistiques d'aujourd'hui avec possibilité d'annulation via toast.
   */
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

  const handleOptionsChange = () => {
    options = { ...options, soundEnabled: dom.soundEnabledInput.checked };
    dom.soundEnabledInput.setAttribute("aria-checked", dom.soundEnabledInput.checked ? "true" : "false");
    saveState(snapshot());
  };

  const handleThemeToggle = () => {
    const nextTheme = getSafeTheme(options.theme) === "dark" ? "light" : "dark";
    options = { ...options, theme: nextTheme };
    applyTheme(nextTheme);
    applyModeSelection();
    publishRunState(isRunning ? "running" : "ready");
    saveState(snapshot());
    announce(getText().theme.selected(nextTheme === "dark" ? getText().theme.dark : getText().theme.light));
  };

  const handleLanguageChange = (language) => {
    const nextLanguage = getSafeLanguage(language);
    if (nextLanguage === getLanguage()) return;
    options = { ...options, language: nextLanguage };
    syncUi();
    saveState(snapshot());
    announce(getText().language[nextLanguage === "fr" ? "frSelected" : "enSelected"]);
  };

  // --- Navigation au clavier (Pattern Tablist WAI-ARIA) ---
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

    const targetBtn = modeButtons[nextIndex];
    if (targetBtn) {
      targetBtn.click();
      targetBtn.focus();
    }
  });

  // --- Restauration de l'état persistant ---
  const restoreState = () => {
    const state = loadState();
    setDurationInputs(state.settings);
    options = { ...defaultOptions, ...(state.options || {}) };
    mode = ["focus", "short", "long"].includes(state.progress.mode) ? state.progress.mode : "focus";
    pendingMode = ["focus", "short", "long"].includes(state.progress.pendingMode) ? state.progress.pendingMode : null;
    remainingSeconds = Math.max(0, Number(state.progress.remainingSeconds) || getModeDurationSeconds(mode));
    currentDurationSeconds = Math.max(1, Number(state.progress.currentDurationSeconds) || getModeDurationSeconds(mode));
    sessionNumber = Math.max(1, Number(state.progress.sessionNumber) || 1);
    completedSessions = Math.max(0, Number(state.progress.completedSessions) || 0);
    totalFocusMinutes = Math.max(0, Number(state.progress.totalFocusMinutes) || 0);
    isRunning = Boolean(state.progress.isRunning);
    lastTickAt = state.progress.lastTickAt || null;

    // Calcul du temps écoulé si la page a été fermée alors que le timer tournait
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
      publishRunState("ready");
    }
  };

  // --- Gestion de l'orientation paysage sur tablette ---
  const handleTabletOrientation = () => {
    try {
      const minDim = Math.min(window.screen.width, window.screen.height);
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      if (hasTouch && minDim >= 600 && screen.orientation && typeof screen.orientation.lock === "function") {
        screen.orientation.lock("landscape").catch(() => {});
      }
    } catch { }
  };

  // --- Écouteurs d'événements principaux ---
  dom.startPauseBtn.addEventListener("click", async () => {
    handleTabletOrientation();
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
    publishRunState("ready");
    saveState(snapshot());
    announce(
      resumable
        ? getText().announcements.restored(getModeLabel(mode, getLanguage()))
        : getText().announcements.selected(getModeLabel(mode, getLanguage())),
    );
  });

  [dom.focusInput, dom.shortInput, dom.longInput, dom.sessionsInput].forEach((input) => {
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

  // Raccourci Espace pour Démarrer / Mettre en pause depuis n'importe où
  document.addEventListener("keydown", (event) => {
    if (event.key !== " " && event.code !== "Space") return;
    if (event.repeat) return;
    if (dom.appDialog && dom.appDialog.open) return;
    const target = event.target instanceof Element ? event.target : null;
    if (target && target.closest("input, textarea, select, button, a[href], [contenteditable='true']")) return;
    event.preventDefault();
    dom.startPauseBtn.click();
  });

  // --- Initialisation au chargement ---
  handleTabletOrientation();
  restoreState();
};

// ============================================================================
// 9. ENREGISTREMENT DU SERVICE WORKER (PWA & MODE HORS-LIGNE)
// ============================================================================
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("./sw.js")
    .then((reg) => console.log("Service Worker enregistré avec succès (scope) :", reg.scope))
    .catch((err) => console.error("Échec de l'enregistrement du Service Worker :", err));
}

// Démarrage sécurisé lorsque le DOM est totalement chargé
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPomodoro);
} else {
  initPomodoro();
}

