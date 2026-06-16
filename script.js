const STORAGE_KEY = 'pomodoro-app-state-v10';
const NOTIFICATION_PROMPT_KEY = 'pomodoro-notification-prompted-v1';
const TITLE_BASE = 'Pomodoro';
const RING_RADIUS = 104;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const CURRENT_SCHEMA_VERSION = 1;

const defaultOptions = { soundEnabled: true };

const getDefaultState = () => ({
  _schemaVersion: CURRENT_SCHEMA_VERSION,
  settings: { focus: 25, shortBreak: 5, longBreak: 15, sessions: 4 },
  options: { ...defaultOptions },
  progress: {
    mode: 'focus',
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

const clampValue = (value, min, max) => Math.min(Math.max(value, min), max);

const formatTime = (totalSeconds) => {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

const getModeLabel = (mode = 'focus') => {
  if (mode === 'focus') return 'Focus';
  if (mode === 'short') return 'Short Break';
  return 'Long Break';
};

const getModeText = (mode = 'focus') => {
  if (mode === 'focus') return 'Stay focused';
  if (mode === 'short') return 'Take a short break';
  return 'Take a longer break';
};

// ============================================================
// DOM REFERENCES
// ============================================================
const dom = {
  timeDisplay: document.getElementById('timeDisplay'),
  modeText: document.getElementById('modeText'),
  srAnnouncement: document.getElementById('srAnnouncement'),
  progressRing: document.getElementById('progressRing'),
  sessionCount: document.getElementById('sessionCount'),
  statusBadge: document.getElementById('statusBadge'),
  startPauseBtn: document.getElementById('startPauseBtn'),
  resetBtn: document.getElementById('resetBtn'),
  modeSwitcher: document.getElementById('modeSwitcher'),
  modeFocusBtn: document.getElementById('modeFocusBtn'),
  modeShortBtn: document.getElementById('modeShortBtn'),
  modeLongBtn: document.getElementById('modeLongBtn'),
  focusInput: document.getElementById('focusInput'),
  shortInput: document.getElementById('shortInput'),
  longInput: document.getElementById('longInput'),
  sessionsInput: document.getElementById('sessionsInput'),
  soundEnabledInput: document.getElementById('soundEnabledInput'),
  focusLabel: document.getElementById('focusLabel'),
  shortLabel: document.getElementById('shortLabel'),
  longLabel: document.getElementById('longLabel'),
  completedCount: document.getElementById('completedCount'),
  totalFocus: document.getElementById('totalFocus'),
};

if (Object.values(dom).some((el) => !el)) {
  throw new Error('Pomodoro DOM is incomplete');
}

// ============================================================
// STATE VALIDATION (hardened localStorage)
// ============================================================
const validateState = (parsed) => {
  if (!parsed || typeof parsed !== 'object') return null;
  if (parsed._schemaVersion !== CURRENT_SCHEMA_VERSION) return null;

  const { settings, options, progress } = parsed;
  if (!settings || typeof settings !== 'object') return null;
  if (!options || typeof options !== 'object') return null;
  if (!progress || typeof progress !== 'object') return null;

  const isFiniteNum = (v) => typeof v === 'number' && Number.isFinite(v);
  const isBool = (v) => typeof v === 'boolean';
  const isStrOrNull = (v) => typeof v === 'string' || v === null;
  const validMode = (v) => ['focus', 'short', 'long'].includes(v);

  if (!isFiniteNum(settings.focus)) return null;
  if (!isFiniteNum(settings.shortBreak)) return null;
  if (!isFiniteNum(settings.longBreak)) return null;
  if (!isFiniteNum(settings.sessions)) return null;
  if (!isBool(options.soundEnabled)) return null;
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

// ============================================================
// SETTINGS HELPERS
// ============================================================
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

const setDurationInputs = (settings) => {
  dom.focusInput.value = clampValue(Number(settings.focus) || 25, 1, 120);
  dom.shortInput.value = clampValue(Number(settings.shortBreak) || 5, 1, 60);
  dom.longInput.value = clampValue(Number(settings.longBreak) || 15, 1, 60);
  dom.sessionsInput.value = clampValue(Number(settings.sessions) || 4, 1, 20);
};

const getModeDurationSeconds = (mode) => {
  const { focus, shortBreak, longBreak } = readDurations();
  if (mode === 'focus') return focus * 60;
  if (mode === 'short') return shortBreak * 60;
  return longBreak * 60;
};

const getNextModeAfterCurrent = ({ mode, completedSessions, sessions }) => {
  if (mode === 'focus') {
    const nextCompleted = completedSessions + 1;
    return nextCompleted % sessions === 0 ? 'long' : 'short';
  }
  return 'focus';
};

// ============================================================
// STORAGE
// ============================================================
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

const saveState = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
};

// ============================================================
// MAIN APP
// ============================================================
const initPomodoro = () => {
  let timerId = null;
  let mode = 'focus';
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

  // --- Screen reader announcements ---
  const announce = (message) => {
    dom.srAnnouncement.textContent = '';
    window.setTimeout(() => {
      dom.srAnnouncement.textContent = message;
    }, 10);
  };

  // --- Title update ---
  const updateTitle = () => {
    document.title = `${formatTime(remainingSeconds)} · ${getModeLabel(mode)} · ${TITLE_BASE}`;
  };

  // --- Status badge ---
  const updateStatusBadge = (status) => {
    dom.statusBadge.textContent = status;
    dom.statusBadge.className = 'rounded-full px-3 py-1 text-sm font-medium';
    if (status === 'Running') dom.statusBadge.classList.add('bg-emerald-50', 'text-emerald-700');
    else if (status === 'Paused') dom.statusBadge.classList.add('bg-amber-50', 'text-amber-700');
    else dom.statusBadge.classList.add('bg-slate-100', 'text-slate-700');
  };

  // --- Mode tabs ARIA + visual state ---
  const applyModeSelection = () => {
    const buttons = [
      { el: dom.modeFocusBtn, targetMode: 'focus' },
      { el: dom.modeShortBtn, targetMode: 'short' },
      { el: dom.modeLongBtn, targetMode: 'long' },
    ];

    const baseClasses = ['rounded-full', 'px-4', 'py-1', 'text-sm', 'font-semibold', 'transition'];
    const inactiveClasses = ['text-slate-500', 'hover:text-slate-900'];
    const activeClasses = ['bg-slate-900', 'text-white'];

    buttons.forEach(({ el, targetMode }) => {
      const active = mode === targetMode;
      el.className = '';
      baseClasses.forEach((c) => el.classList.add(c));
      (active ? activeClasses : inactiveClasses).forEach((c) => el.classList.add(c));
      // ARIA: update tab selection state
      el.setAttribute('aria-selected', active ? 'true' : 'false');
      el.setAttribute('tabindex', active ? '0' : '-1');
    });
  };

  // --- Labels & stats ---
  const updateLabels = () => {
    const { focus, shortBreak, longBreak } = readDurations();
    dom.focusLabel.textContent = `${focus} min`;
    dom.shortLabel.textContent = `${shortBreak} min`;
    dom.longLabel.textContent = `${longBreak} min`;
    dom.sessionCount.textContent = `Session ${sessionNumber}`;
    dom.completedCount.textContent = String(completedSessions);
    dom.totalFocus.textContent = `${totalFocusMinutes} min`;
  };

  // --- Progress ring visual + ARIA ---
  const updateProgressRing = () => {
    const safeDuration = Math.max(1, currentDurationSeconds);
    const progress = Math.min(1, Math.max(0, (safeDuration - remainingSeconds) / safeDuration));
    const offset = RING_CIRCUMFERENCE * (1 - progress);
    dom.progressRing.style.strokeDasharray = `${RING_CIRCUMFERENCE}`;
    dom.progressRing.style.strokeDashoffset = `${offset}`;
    // ARIA: update progressbar value (0-100)
    const percent = Math.round(progress * 100);
    dom.progressRing.setAttribute('aria-valuenow', String(percent));
  };

  // --- Time display ---
  const updateTimeDisplay = () => {
    dom.timeDisplay.textContent = formatTime(remainingSeconds);
    dom.modeText.textContent = getModeText(mode);
    updateTitle();
    updateProgressRing();
  };

  // --- Full UI sync ---
  const syncUi = () => {
    updateTimeDisplay();
    applyModeSelection();
    updateLabels();
    dom.soundEnabledInput.checked = Boolean(options.soundEnabled);
    dom.startPauseBtn.textContent = isRunning ? 'Pause' : 'Start';
    dom.startPauseBtn.setAttribute('aria-label', isRunning ? 'Pause timer' : 'Start timer');
    updateStatusBadge(isRunning ? 'Running' : 'Ready');
  };

  // --- State snapshot ---
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
  const ensureAudio = async () => {
    if (!options.soundEnabled) return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!audioContext) audioContext = new AudioCtx();
    if (audioContext.state === 'suspended') {
      try {
        await audioContext.resume();
      } catch {
        return null;
      }
    }
    return audioContext;
  };

  const playBeep = async () => {
    if (!options.soundEnabled) return;
    const ctx = await ensureAudio();
    if (!ctx) return;
    const now = ctx.currentTime;
    [880, 660, 880].forEach((freq, index) => {
      const startAt = now + index * 0.18;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
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
  const notifyCompletion = (completedMode) => {
    if (!('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    try {
      new Notification(`Pomodoro · ${completedMode} complete`, {
        body: 'Press Start when you are ready for the next session.',
      });
    } catch {}
  };

  const canAskNotificationPermission = () => {
    if (!('Notification' in window)) return false;
    if (Notification.permission !== 'default') return false;
    return !localStorage.getItem(NOTIFICATION_PROMPT_KEY);
  };

  const requestNotificationPermissionOnce = async () => {
    if (!canAskNotificationPermission()) return;
    localStorage.setItem(NOTIFICATION_PROMPT_KEY, '1');
    try {
      await Notification.requestPermission();
    } catch {}
  };

  // ============================================================
  // TIMER CONTROL
  // ============================================================
  const stopTimer = (status = 'Paused') => {
    clearInterval(timerId);
    timerId = null;
    isRunning = false;
    lastTickAt = null;
    dom.startPauseBtn.textContent = 'Start';
    dom.startPauseBtn.setAttribute('aria-label', 'Start timer');
    updateStatusBadge(status);
    saveState(snapshot());
  };

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
    if (completedMode === 'focus') {
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
    notifyCompletion(getModeLabel(completedMode));
    announce(`${getModeLabel(completedMode)} complete. Press Start to continue.`);
  };

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
    updateStatusBadge('Running');
    dom.startPauseBtn.textContent = 'Pause';
    dom.startPauseBtn.setAttribute('aria-label', 'Pause timer');
    updateTimeDisplay();
    saveState(snapshot());
    timerId = setInterval(tick, 1000);
    announce(`${getModeText(mode)} timer started.`);
  };

  const resetTimer = () => {
    stopTimer('Ready');
    mode = 'focus';
    pendingMode = null;
    remainingSeconds = getModeDurationSeconds('focus');
    currentDurationSeconds = remainingSeconds;
    sessionNumber = 1;
    completedSessions = 0;
    totalFocusMinutes = 0;
    syncUi();
    saveState(snapshot());
    announce('Timer reset.');
  };

  // ============================================================
  // SETTINGS HANDLERS
  // ============================================================
  const handleSettingsChange = () => {
    const { focus, shortBreak, longBreak } = readDurations();
    if (!isRunning) {
      if (mode === 'focus') remainingSeconds = focus * 60;
      else if (mode === 'short') remainingSeconds = shortBreak * 60;
      else remainingSeconds = longBreak * 60;
      currentDurationSeconds = remainingSeconds;
    }
    updateTimeDisplay();
    updateLabels();
    saveState(snapshot());
  };

  const handleOptionsChange = () => {
    options = { ...options, soundEnabled: dom.soundEnabledInput.checked };
    saveState(snapshot());
  };

  // ============================================================
  // KEYBOARD NAVIGATION (tablist pattern)
  // ============================================================
  const modeButtons = [dom.modeFocusBtn, dom.modeShortBtn, dom.modeLongBtn];
  const modeOrder = ['focus', 'short', 'long'];

  dom.modeSwitcher.addEventListener('keydown', (event) => {
    const currentIndex = modeOrder.indexOf(mode);
    let nextIndex = currentIndex;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        nextIndex = (currentIndex + 1) % modeOrder.length;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        nextIndex = (currentIndex - 1 + modeOrder.length) % modeOrder.length;
        break;
      case 'Home':
        event.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
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
    mode = ['focus', 'short', 'long'].includes(state.progress.mode) ? state.progress.mode : 'focus';
    pendingMode = ['focus', 'short', 'long'].includes(state.progress.pendingMode) ? state.progress.pendingMode : null;
    remainingSeconds = Math.max(0, Number(state.progress.remainingSeconds) || getModeDurationSeconds(mode));
    currentDurationSeconds = Math.max(1, Number(state.progress.currentDurationSeconds) || getModeDurationSeconds(mode));
    sessionNumber = Math.max(1, Number(state.progress.sessionNumber) || 1);
    completedSessions = Math.max(0, Number(state.progress.completedSessions) || 0);
    totalFocusMinutes = Math.max(0, Number(state.progress.totalFocusMinutes) || 0);
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
      updateStatusBadge('Ready');
    }
  };

  // ============================================================
  // EVENT LISTENERS
  // ============================================================
  dom.startPauseBtn.addEventListener('click', async () => {
    if (isRunning) {
      stopTimer('Paused');
      announce('Timer paused.');
    } else {
      await startTimer();
    }
  });

  dom.resetBtn.addEventListener('click', resetTimer);

  dom.modeSwitcher.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button || !dom.modeSwitcher.contains(button)) return;
    const nextMode = button.dataset.mode;
    if (!nextMode) return;
    stopTimer('Ready');
    pendingMode = null;
    mode = nextMode;
    remainingSeconds = getModeDurationSeconds(nextMode);
    currentDurationSeconds = remainingSeconds;
    applyModeSelection();
    updateLabels();
    updateTimeDisplay();
    updateStatusBadge('Ready');
    saveState(snapshot());
    announce(`${getModeLabel(mode)} selected.`);
  });

  [dom.focusInput, dom.shortInput, dom.longInput, dom.sessionsInput].forEach((input) => {
    input.addEventListener('change', handleSettingsChange);
    input.addEventListener('input', handleSettingsChange);
  });

  dom.soundEnabledInput.addEventListener('change', handleOptionsChange);

  // ============================================================
  // INIT
  // ============================================================
  restoreState();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initPomodoro);
} else {
  initPomodoro();
}
