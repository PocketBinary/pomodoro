/**
 * ============================================================================
 * MODULE : GESTIONNAIRE DES MÉDIAS DE PAUSE (break-media.js)
 * ============================================================================
 * 
 * Ce script gère l'ambiance sonore et visuelle lors des phases de pause :
 * 1. Pistes musicales relaxantes (.mp3) synchronisées avec le minuteur.
 * 2. Animations vectorielles zen (.svg) assainies et synchronisées sur la durée.
 * 3. Asservissement automatique : la musique démarre avec le chrono et se met en
 *    pause automatiquement quand le minuteur s'arrête ou bascule en mode Focus.
 * 4. Persistance du réglage de volume dans le localStorage.
 * 5. Respect strict de la politique de sécurité (CSP) et assainissement anti-XSS.
 * ============================================================================
 */

(() => {
  // Clé de persistance pour les préférences de volume de la pause
  const STORAGE_KEY = "pomodoro-break-media-v1";

  // Expressions régulières pour valider les noms de fichiers autorisés (sécurité)
  const AUDIO_NAME = /^[A-Za-z0-9][A-Za-z0-9 _.-]{0,80}\.(mp3|ogg|wav|m4a)$/i;
  const SVG_NAME = /^[A-Za-z0-9][A-Za-z0-9 _.-]{0,80}\.svg$/i;

  // Textes d'inspiration / slogans affichés sous le logo selon le mode actif
  const slogans = {
    en: {
      focus: "This block only.",
      pause: "Look up. The next block can wait.",
    },
    fr: {
      focus: "Rien que ce bloc.",
      pause: "Lève les yeux. Le prochain bloc attend.",
    },
  };

  // Dictionnaire de textes d'accessibilité et d'interface pour le lecteur
  const ui = {
    en: {
      player: "Break media",
      volume: "Volume",
      choose: "Choose a track",
      chooseAnim: "Choose an animation",
      empty: "No track yet",
      emptyAnim: "No animation",
    },
    fr: {
      player: "Médias de pause",
      volume: "Volume",
      choose: "Choisir une piste",
      chooseAnim: "Choisir une animation",
      empty: "Aucune piste",
      emptyAnim: "Aucune animation",
    },
  };

  // Récupération des éléments du Document Object Model (DOM)
  const sloganEl = document.getElementById("appSlogan");
  const atmosphere = document.getElementById("breakAtmosphere");
  const playBtn = document.getElementById("breakPlayBtn");
  const select = document.getElementById("breakTrackSelect");
  const pickLabel = document.getElementById("breakPickLabel");
  const animSelect = document.getElementById("breakAnimSelect");
  const animLabel = document.getElementById("breakAnimLabel");
  const volume = document.getElementById("breakVolume");
  const volumeLabel = document.getElementById("breakVolumeLabel");
  const audio = document.getElementById("breakAudio");
  const animation = document.getElementById("breakAnimation");
  const fallback = document.querySelector(".break-fallback");
  const player = document.getElementById("breakPlayer");
  const switcher = document.getElementById("modeSwitcher");
  const stage = document.getElementById("breakStage");
  const timeDisplay = document.getElementById("timeDisplay");
  const statusBadge = document.getElementById("statusBadge");
  const shortInput = document.getElementById("shortInput");
  const longInput = document.getElementById("longInput");

  // Si des éléments essentiels manquent dans la page, on interrompt silencieusement
  if (!sloganEl || !atmosphere || !playBtn || !select || !pickLabel || !animSelect || !animLabel || !volume || !volumeLabel || !audio || !animation || !fallback || !player || !switcher || !stage) {
    return;
  }

  // Conteneur dynamique sécurisé pour les SVG injectés
  const svgHost = document.createElement("div");
  svgHost.className = "break-svg";
  svgHost.style.cssText = "position:relative;z-index:1;width:100%;height:100%";
  stage.append(svgHost);
  animation.hidden = true;

  // Liste de secours des fichiers MP3 disponibles par défaut dans /media/
  const DEFAULT_PLAYLIST = [
    "zen calming.mp3",
    "zen garden.mp3",
    "zen music 01.mp3",
    "zen music 02.mp3",
    "zen piano.mp3",
  ];

  // Liste de secours des animations vectorielles disponibles par défaut dans /media/
  const DEFAULT_ANIMATIONS = [
    "Zen Ying-Yang.svg",
    "ZenMan.svg",
    "ZenNenuphar.svg",
    "ZENWoman.svg",
  ];

  // États internes du lecteur de pause
  let playlist = [...DEFAULT_PLAYLIST];
  let animations = [...DEFAULT_ANIMATIONS];
  let currentTrackIndex = 0;
  // Animation choisie par l'utilisateur (nom de fichier), null = première de la liste
  let chosenAnimation = null;
  let wantsPlay = false;
  let shownMode = null;
  let shownFile = "";
  let svgToken = 0;
  const svgCache = new Map();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /**
   * Détecte la langue courante du document ('fr' ou 'en').
   * @returns {'fr'|'en'}
   */
  const lang = () => (document.documentElement.lang === "fr" ? "fr" : "en");

  /**
   * Retourne le dictionnaire de libellés pour la langue courante.
   */
  const copy = () => ui[lang()];

  /**
   * Détermine le mode de minuteur actuellement sélectionné dans l'interface.
   * @returns {'focus'|'short'|'long'}
   */
  const currentMode = () => {
    const selected = switcher.querySelector('[aria-selected="true"]');
    const value = selected && selected.dataset.mode;
    return value === "short" || value === "long" ? value : "focus";
  };

  /**
   * Assainit et valide un nom de fichier par rapport à une regex de sécurité.
   * Évite les attaques par traversée de répertoire ('..').
   */
  const safeName = (value, pattern) => {
    if (typeof value !== "string") return null;
    const name = value.trim();
    if (!pattern.test(name) || name.includes("..")) return null;
    return name;
  };

  /**
   * Construit une URL absolue propre pour un média situé dans le dossier media/.
   */
  const fileUrl = (name) =>
    new URL(`media/${encodeURIComponent(name)}`, document.baseURI).href;

  /**
   * Borne une valeur numérique entre un minimum et un maximum.
   */
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  /**
   * Lit toutes les préférences de pause sauvegardées (volume + animation choisie).
   */
  const readPrefs = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch {
      return {};
    }
  };

  /**
   * Fusionne et enregistre une préférence sans écraser les autres clés.
   */
  const savePrefs = (patch) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...readPrefs(), ...patch }));
    } catch {
      return;
    }
  };

  /**
   * Lit le niveau de volume sauvegardé dans le localStorage (par défaut : 40%).
   */
  const readVolume = () => {
    const value = Number(readPrefs().volume);
    return Number.isFinite(value) ? clamp(value, 0, 1) : 0.4;
  };

  /**
   * Enregistre le niveau de volume actuel dans le localStorage.
   */
  const saveVolume = (value) => {
    savePrefs({ volume: value });
  };

  /**
   * Retourne la liste filtrée et sécurisée des pistes audio valides.
   */
  const tracksFor = () =>
    (playlist || []).map((name) => safeName(name, AUDIO_NAME)).filter(Boolean);

  /**
   * Retourne la liste filtrée et sécurisée des animations SVG valides.
   */
  const svgsFor = () =>
    (animations || []).map((name) => safeName(name, SVG_NAME)).filter(Boolean);

  /**
   * Inspecte le badge de statut pour déterminer si le minuteur tourne ou est en pause.
   * @returns {'running'|'paused'|'ready'}
   */
  const timerState = () => {
    const cls = statusBadge ? statusBadge.className : "";
    if (cls.includes("emerald")) return "running";
    if (cls.includes("amber")) return "paused";
    return "ready";
  };

  /**
   * Met à jour le slogan inspirant selon le mode actif (focus vs pause).
   */
  const applySlogan = () => {
    const key = currentMode() === "focus" ? "focus" : "pause";
    sloganEl.textContent = slogans[lang()][key];
  };

  /**
   * Met à jour les libellés d'accessibilité ARIA du lecteur.
   */
  const applyLabels = () => {
    const text = copy();
    player.setAttribute("aria-label", text.player);
    pickLabel.textContent = text.choose;
    animLabel.textContent = text.chooseAnim;
    volumeLabel.textContent = text.volume;
  };

  /**
   * Remplit le menu déroulant <select> avec la liste des morceaux audio disponibles.
   */
  const fillSelect = () => {
    const text = copy();
    const tracks = tracksFor();
    select.replaceChildren();
    if (!tracks.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = text.empty;
      select.append(option);
      select.disabled = true;
      return;
    }
    select.disabled = false;
    tracks.forEach((name, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = name.replace(/\.[^.]+$/, "");
      select.append(option);
    });
    currentTrackIndex = ((currentTrackIndex % tracks.length) + tracks.length) % tracks.length;
    select.value = String(currentTrackIndex);
  };

  /**
   * Remplit le menu déroulant des animations et restaure le choix sauvegardé.
   */
  const fillAnimSelect = () => {
    const text = copy();
    const files = svgsFor();
    animSelect.replaceChildren();
    if (!files.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = text.emptyAnim;
      animSelect.append(option);
      animSelect.disabled = true;
      return;
    }
    animSelect.disabled = false;
    files.forEach((name, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = name.replace(/\.[^.]+$/, "");
      animSelect.append(option);
    });
    const savedIndex = files.indexOf(chosenAnimation);
    const index = savedIndex >= 0 ? savedIndex : 0;
    chosenAnimation = files[index];
    animSelect.value = String(index);
  };

  /**
   * Détecte les URLs potentielles de scripts ou de requêtes réseau non autorisées.
   */
  const unsafeUrl = (value) => /^(javascript:|data:|https?:|\/\/)/i.test(value.trim());

  /**
   * Assainit le DOM SVG pour supprimer tout script, iframe ou attribut dangereux (anti-XSS).
   */
  const sanitizeSvg = (doc) => {
    doc.querySelectorAll("script,foreignObject,iframe,object,embed,audio,video,link,meta,use,set,handler,listener").forEach((node) => node.remove());
    doc.querySelectorAll("*").forEach((node) => {
      [...node.attributes].forEach((attr) => {
        const name = attr.name.toLowerCase();
        const value = attr.value || "";
        if (name.startsWith("on")) {
          node.removeAttribute(attr.name);
          return;
        }
        if (name === "href" || name.endsWith(":href") || name === "src" || name === "xlink:href") {
          if (!value.startsWith("#") || value.includes("\\")) node.removeAttribute(attr.name);
          else if (unsafeUrl(value)) node.removeAttribute(attr.name);
          return;
        }
        if (name === "style" && /javascript:|expression\s*\(|@import|url\s*\(\s*['\"]?\s*(https?:|\/\/)/i.test(value)) {
          node.removeAttribute(attr.name);
        }
      });
    });
    const svg = doc.documentElement;
    if (!svg || svg.tagName.toLowerCase() !== "svg") return null;
    svg.querySelectorAll("animate,animateTransform,animateMotion,set").forEach((node) => {
      node.setAttribute("repeatCount", "indefinite");
    });
    const style = doc.createElementNS("http://www.w3.org/2000/svg", "style");
    style.textContent = "*{animation-iteration-count:infinite !important;animation-play-state:var(--svg-play,running) !important}";
    svg.prepend(style);
    svg.style.width = "100%";
    svg.style.height = "100%";
    svg.style.display = "block";
    return svg;
  };

  /**
   * Charge et assainit une animation SVG depuis le dossier media/ avec mise en cache mémoire.
   */
  const loadSvg = (name) => {
    const url = fileUrl(name);
    if (!svgCache.has(url)) {
      svgCache.set(url, fetch(url, { cache: "no-store" }).then(async (response) => {
        if (!response.ok) return null;
        const raw = await response.text();
        if (raw.length > 400000 || !/<svg[\s>]/i.test(raw)) return null;
        const parsed = new DOMParser().parseFromString(raw, "image/svg+xml");
        if (parsed.querySelector("parsererror")) return null;
        return sanitizeSvg(parsed);
      }).catch(() => null));
    }
    return svgCache.get(url);
  };

  /**
   * Recadre le viewBox sur le dessin réellement dessiné.
   * Les SVG sources réservent de grandes marges internes (ZenMan dessine dans
   * 411×310 d'un viewBox de 800×600) : sans ce recadrage l'illustration est
   * réduite à un timbre-poste dans une scène large. La scène, elle, ne change pas.
   */
  const measureAnimatedBox = (svg) => {
    const union = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
    const take = () => {
      let box;
      try {
        box = svg.getBBox();
      } catch {
        return;
      }
      if (!box || (!box.width && !box.height)) return;
      union.x0 = Math.min(union.x0, box.x);
      union.y0 = Math.min(union.y0, box.y);
      union.x1 = Math.max(union.x1, box.x + box.width);
      union.y1 = Math.max(union.y1, box.y + box.height);
    };

    // Une pièce mobile sort de sa boîte de départ (ZenNenuphar voyage de ~50 unités).
    // On échantillonne la timeline SMIL pour cadrer tout le trajet, pas seulement t=0.
    if (typeof svg.setCurrentTime === "function" && typeof svg.pauseAnimations === "function") {
      const origin = typeof svg.getCurrentTime === "function" ? svg.getCurrentTime() : 0;
      svg.pauseAnimations();
      for (let t = 0; t <= 8; t += 0.5) {
        svg.setCurrentTime(t);
        take();
      }
      svg.setCurrentTime(origin);
      svg.unpauseAnimations();
    } else {
      take();
    }

    if (!Number.isFinite(union.x0) || union.x1 <= union.x0) return null;
    return { x: union.x0, y: union.y0, width: union.x1 - union.x0, height: union.y1 - union.y0 };
  };

  const fitSvgToContent = (svg) => {
    if (!svg || typeof svg.getBBox !== "function") return;
    const box = measureAnimatedBox(svg);
    if (!box) return;
    const pad = Math.max(box.width, box.height) * 0.03;
    svg.setAttribute(
      "viewBox",
      `${box.x - pad} ${box.y - pad} ${box.width + pad * 2} ${box.height + pad * 2}`,
    );
    // Le dessin doit tenir entièrement dans la scène, jamais être rogné
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  };

  /**
   * Met en pause ou réactive les animations SVG selon l'état du minuteur et les préférences système.
   */
  const setMotion = (paused) => {
    fallback.style.animationPlayState = paused || reduceMotion ? "paused" : "running";
    const svg = svgHost.querySelector("svg");
    if (svg) {
      svg.style.setProperty("--svg-play", paused || reduceMotion ? "paused" : "running");
      if (paused || reduceMotion) {
        if (svg.pauseAnimations) svg.pauseAnimations();
      } else if (svg.unpauseAnimations) {
        svg.unpauseAnimations();
      }
    }
  };

  /**
   * Efface l'animation SVG active du conteneur.
   */
  const clearSvg = () => {
    shownFile = "";
    svgToken += 1;
    const svg = svgHost.querySelector("svg");
    if (svg && svg.pauseAnimations) svg.pauseAnimations();
    svgHost.replaceChildren();
    animation.hidden = true;
    animation.removeAttribute("src");
  };

  /**
   * Affiche l'animation choisie par l'utilisateur, qui boucle pendant toute la pause.
   */
  const syncAnimations = async () => {
    const mode = currentMode();
    if (mode === "focus") {
      clearSvg();
      fallback.hidden = false;
      return;
    }
    const files = svgsFor();
    const paused = timerState() === "paused";
    if (!files.length) {
      clearSvg();
      animation.hidden = true;
      fallback.hidden = false;
      setMotion(paused);
      return;
    }
    // Le choix de l'utilisateur prime ; à défaut, la première animation de la liste
    const index = Math.max(0, files.indexOf(chosenAnimation));
    const key = files[index];
    if (shownFile !== key) {
      shownFile = key;
      const token = ++svgToken;
      const svg = await loadSvg(files[index]);
      if (token !== svgToken || shownFile !== key || currentMode() === "focus") return;
      svgHost.replaceChildren();
      if (!svg) {
        animation.src = fileUrl(files[index]);
        animation.hidden = false;
        fallback.hidden = true;
        setMotion(paused);
        return;
      }
      animation.hidden = true;
      animation.removeAttribute("src");
      svgHost.append(svg.cloneNode(true));
      // getBBox() can answer zero on the very frame of insertion, before the
      // browser has laid the clone out: fit now, then once more on the next frame.
      fitSvgToContent(svgHost.querySelector("svg"));
      window.requestAnimationFrame(() => fitSvgToContent(svgHost.querySelector("svg")));
      fallback.hidden = true;
    }
    setMotion(paused);
  };

  /**
   * Charge une piste musicale et démarre la lecture si requis.
   */
  const loadTrack = async (shouldPlay) => {
    const tracks = tracksFor();
    if (!tracks.length) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      return;
    }
    currentTrackIndex = ((currentTrackIndex % tracks.length) + tracks.length) % tracks.length;
    const src = fileUrl(tracks[currentTrackIndex]);
    audio.loop = tracks.length === 1;
    audio.volume = Number(volume.value);
    if (audio.src !== src) audio.src = src;
    if (!shouldPlay) {
      applyLabels();
      return;
    }
    try {
      await audio.play();
      wantsPlay = true;
    } catch {
      wantsPlay = false;
    }
    applyLabels();
  };

  /**
   * Asservit la musique de pause au minuteur :
   * - En mode Focus : arrêt complet.
   * - En mode Pause (courte/longue) et chrono actif : lecture automatique.
   * - En mode Pause et chrono suspendu : mise en pause du son.
   */
  const syncMusicWithTimer = () => {
    const mode = currentMode();
    if (mode === "focus") {
      wantsPlay = false;
      audio.pause();
      return;
    }
    const state = timerState();
    if (state === "running") {
      wantsPlay = true;
      loadTrack(true);
    } else {
      wantsPlay = false;
      audio.pause();
    }
  };

  /**
   * Synchronisation globale de l'interface des médias de pause.
   */
  const sync = () => {
    const mode = currentMode();
    applySlogan();
    if (mode === "focus") {
      atmosphere.hidden = true;
      audio.pause();
      clearSvg();
      shownMode = "focus";
      applyLabels();
      return;
    }
    atmosphere.hidden = false;
    shownMode = mode;
    fillSelect();
    fillAnimSelect();
    syncAnimations();
    syncMusicWithTimer();
    applyLabels();
  };

  // --- Événements utilisateurs du lecteur de pause ---

  // Changement de morceau via le menu déroulant
  select.addEventListener("change", async () => {
    const next = Number(select.value);
    if (!Number.isInteger(next)) return;
    currentTrackIndex = next;
    const shouldPlay = timerState() === "running" && currentMode() !== "focus";
    await loadTrack(shouldPlay);
  });

  // Choix manuel de l'animation de pause, mémorisé pour les pauses suivantes
  animSelect.addEventListener("change", () => {
    const files = svgsFor();
    const next = files[Number(animSelect.value)];
    if (!next) return;
    chosenAnimation = next;
    savePrefs({ animation: next });
    if (currentMode() !== "focus") syncAnimations();
  });

  // Ajustement du curseur de volume avec sauvegarde
  volume.addEventListener("input", () => {
    const value = clamp(Number(volume.value) || 0, 0, 1);
    audio.volume = value;
    volume.setAttribute("aria-valuenow", String(Math.round(value * 100)));
    saveVolume(value);
  });

  // Enchaînement automatique sur la piste suivante à la fin d'un morceau
  audio.addEventListener("ended", async () => {
    const tracks = tracksFor();
    if (tracks.length < 2) return;
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    fillSelect();
    const shouldPlay = timerState() === "running" && currentMode() !== "focus";
    if (shouldPlay) await loadTrack(true);
  });

  audio.addEventListener("play", applyLabels);
  audio.addEventListener("pause", applyLabels);
  audio.addEventListener("error", () => {
    if (!audio.getAttribute("src")) return;
    wantsPlay = false;
    applyLabels();
  });

  // Initialisation du volume initial
  const initialVolume = readVolume();
  volume.value = String(initialVolume);
  volume.setAttribute("aria-valuenow", String(Math.round(initialVolume * 100)));
  audio.volume = initialVolume;

  // Restauration de l'animation choisie lors d'une pause précédente
  const savedAnimation = readPrefs().animation;
  if (typeof savedAnimation === "string") chosenAnimation = savedAnimation;

  // Synchronisation avec les clics sur Démarrer / Pause et Réinitialiser
  const startPauseBtn = document.getElementById("startPauseBtn");
  if (startPauseBtn) {
    startPauseBtn.addEventListener("click", () => {
      setTimeout(syncMusicWithTimer, 20);
    });
  }
  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      setTimeout(syncMusicWithTimer, 20);
    });
  }

  // Observateurs de mutations DOM pour réagir aux changements de mode et de statut
  new MutationObserver(sync).observe(switcher, {
    attributes: true,
    subtree: true,
    attributeFilter: ["aria-selected"],
  });
  new MutationObserver(sync).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang"],
  });
  if (timeDisplay) {
    new MutationObserver(() => {
      if (currentMode() !== "focus") syncAnimations();
    }).observe(timeDisplay, { childList: true, characterData: true, subtree: true });
  }
  if (statusBadge) {
    new MutationObserver(() => {
      if (currentMode() !== "focus") {
        syncAnimations();
        syncMusicWithTimer();
      } else {
        audio.pause();
      }
    }).observe(statusBadge, { attributes: true, attributeFilter: ["class"] });
  }
  [shortInput, longInput].forEach((input) => {
    if (!input) return;
    input.addEventListener("input", () => {
      if (currentMode() !== "focus") syncAnimations();
    });
  });

  // Découverte dynamique de la configuration média via media/media.json
  const readMediaConfig = () => {
    fetch(new URL("media/media.json", document.baseURI).href, { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || typeof data !== "object") return;
        if (Array.isArray(data.music) && data.music.length > 0) {
          playlist = data.music;
        }
        if (Array.isArray(data.animations) && data.animations.length > 0) {
          animations = data.animations;
        }
        fillSelect();
        fillAnimSelect();
        if (currentMode() !== "focus") {
          syncAnimations();
          if (wantsPlay) loadTrack(true);
        }
      })
      .catch(() => { });
  };

  // Démarrage initial
  fillSelect();
  fillAnimSelect();
  readMediaConfig();
  sync();
})();

