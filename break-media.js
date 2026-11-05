(() => {
  const STORAGE_KEY = "pomodoro-break-media-v1";
  const AUDIO_NAME = /^[A-Za-z0-9][A-Za-z0-9 _.-]{0,80}\.(mp3|ogg|wav|m4a)$/i;
  const SVG_NAME = /^[A-Za-z0-9][A-Za-z0-9 _.-]{0,80}\.svg$/i;
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
  const ui = {
    en: {
      player: "Break music",
      play: "Play break music",
      pause: "Pause break music",
      volume: "Volume",
      choose: "Choose a track",
      empty: "No track yet",
      missing: "Track not found",
    },
    fr: {
      player: "Musique de pause",
      play: "Lire la musique de pause",
      pause: "Mettre la musique en pause",
      volume: "Volume",
      choose: "Choisir une piste",
      empty: "Aucune piste",
      missing: "Piste introuvable",
    },
  };

  const sloganEl = document.getElementById("appSlogan");
  const atmosphere = document.getElementById("breakAtmosphere");
  const playBtn = document.getElementById("breakPlayBtn");
  const select = document.getElementById("breakTrackSelect");
  const pickLabel = document.getElementById("breakPickLabel");
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
  const progressRing = document.getElementById("progressRing");
  const shortInput = document.getElementById("shortInput");
  const longInput = document.getElementById("longInput");

  if (!sloganEl || !atmosphere || !playBtn || !select || !pickLabel || !volume || !volumeLabel || !audio || !animation || !fallback || !player || !switcher || !stage) {
    return;
  }

  const svgHost = document.createElement("div");
  svgHost.className = "break-svg";
  svgHost.style.cssText = "position:relative;z-index:1;width:100%;height:100%";
  stage.append(svgHost);
  animation.hidden = true;

  let playlists = { short: [], long: [] };
  let animations = { short: [], long: [] };
  let indexes = { short: 0, long: 0 };
  let wantsPlay = false;
  let missing = false;
  let shownMode = null;
  let shownFile = "";
  let svgToken = 0;
  const svgCache = new Map();
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const lang = () => (document.documentElement.lang === "fr" ? "fr" : "en");
  const copy = () => ui[lang()];

  const currentMode = () => {
    const selected = switcher.querySelector('[aria-selected="true"]');
    const value = selected && selected.dataset.mode;
    return value === "short" || value === "long" ? value : "focus";
  };

  const safeName = (value, pattern) => {
    if (typeof value !== "string") return null;
    const name = value.trim();
    if (!pattern.test(name) || name.includes("..")) return null;
    return name;
  };

  const fileUrl = (folder, mode, name) =>
    new URL(`media/${folder}/${mode}/${encodeURIComponent(name)}`, document.baseURI).href;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const readVolume = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      const value = parsed && Number(parsed.volume);
      if (Number.isFinite(value)) return clamp(value, 0, 1);
    } catch {
      return 0.4;
    }
    return 0.4;
  };

  const saveVolume = (value) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ volume: value }));
    } catch {
      return;
    }
  };

  const tracksFor = (mode) =>
    (playlists[mode] || []).map((name) => safeName(name, AUDIO_NAME)).filter(Boolean);

  const svgsFor = (mode) =>
    (animations[mode] || []).map((name) => safeName(name, SVG_NAME)).filter(Boolean);

  const timerState = () => {
    const cls = statusBadge ? statusBadge.className : "";
    if (cls.includes("emerald")) return "running";
    if (cls.includes("amber")) return "paused";
    return "ready";
  };

  const remainingSeconds = () => {
    const match = (timeDisplay && timeDisplay.textContent || "").trim().match(/^(\d{1,3}):(\d{2})$/);
    if (!match) return null;
    return Number(match[1]) * 60 + Number(match[2]);
  };

  const configuredSeconds = (mode) => {
    const input = mode === "long" ? longInput : shortInput;
    const fallbackMinutes = mode === "long" ? 15 : 5;
    return clamp(Number(input && input.value) || fallbackMinutes, 1, 60) * 60;
  };

  const timeline = (mode) => {
    const configured = configuredSeconds(mode);
    const remaining = remainingSeconds();
    const percent = Number(progressRing && progressRing.getAttribute("aria-valuenow")) || 0;
    let duration = configured;
    if (remaining !== null && percent > 0 && percent < 100) {
      duration = Math.max(1, Math.round(remaining / (1 - percent / 100)));
    } else if (remaining !== null) {
      duration = Math.max(configured, remaining);
    }
    const elapsed = remaining === null ? 0 : clamp(duration - remaining, 0, duration);
    return { duration, elapsed };
  };

  const applySlogan = () => {
    const key = currentMode() === "focus" ? "focus" : "pause";
    sloganEl.textContent = slogans[lang()][key];
  };

  const applyLabels = () => {
    const text = copy();
    const playing = wantsPlay && !audio.paused;
    player.setAttribute("aria-label", text.player);
    pickLabel.textContent = text.choose;
    volumeLabel.textContent = text.volume;
    playBtn.textContent = playing ? "II" : "\u25b6";
    playBtn.setAttribute("aria-label", missing ? text.missing : playing ? text.pause : text.play);
  };

  const fillSelect = (mode) => {
    const text = copy();
    const tracks = tracksFor(mode);
    select.replaceChildren();
    if (!tracks.length) {
      const option = document.createElement("option");
      option.value = "";
      option.textContent = text.empty;
      select.append(option);
      select.disabled = true;
      playBtn.disabled = true;
      return;
    }
    select.disabled = false;
    playBtn.disabled = false;
    tracks.forEach((name, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = name.replace(/\.[^.]+$/, "");
      select.append(option);
    });
    indexes[mode] = ((indexes[mode] % tracks.length) + tracks.length) % tracks.length;
    select.value = String(indexes[mode]);
  };

  const unsafeUrl = (value) => /^(javascript:|data:|https?:|\/\/)/i.test(value.trim());

  const sanitizeSvg = (doc) => {
    doc.querySelectorAll("script,foreignObject,iframe,object,embed,audio,video,link,meta").forEach((node) => node.remove());
    doc.querySelectorAll("*").forEach((node) => {
      [...node.attributes].forEach((attr) => {
        const name = attr.name.toLowerCase();
        const value = attr.value || "";
        if (name.startsWith("on")) {
          node.removeAttribute(attr.name);
          return;
        }
        if (name === "href" || name.endsWith(":href") || name === "src") {
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

  const loadSvg = (mode, name) => {
    const url = fileUrl("animations", mode, name);
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

  const setMotion = (paused) => {
    fallback.style.animationPlayState = paused || reduceMotion ? "paused" : "running";
    const svg = svgHost.querySelector("svg");
    if (!svg) return;
    svg.style.setProperty("--svg-play", paused || reduceMotion ? "paused" : "running");
    if (paused || reduceMotion) {
      if (svg.pauseAnimations) svg.pauseAnimations();
    } else if (svg.unpauseAnimations) {
      svg.unpauseAnimations();
    }
  };

  const clearSvg = () => {
    shownFile = "";
    svgToken += 1;
    const svg = svgHost.querySelector("svg");
    if (svg && svg.pauseAnimations) svg.pauseAnimations();
    svgHost.replaceChildren();
  };

  const syncAnimations = async () => {
    const mode = currentMode();
    if (mode === "focus") {
      clearSvg();
      fallback.hidden = false;
      return;
    }
    const files = svgsFor(mode);
    const { duration, elapsed } = timeline(mode);
    const paused = timerState() === "paused";
    if (!files.length) {
      clearSvg();
      animation.hidden = true;
      fallback.hidden = false;
      setMotion(paused);
      return;
    }
    const slot = duration / files.length;
    const index = Math.min(files.length - 1, Math.floor(elapsed / Math.max(slot, 0.001)));
    const key = `${mode}/${files[index]}/${files.length}`;
    if (shownFile !== key) {
      shownFile = key;
      const token = ++svgToken;
      const svg = await loadSvg(mode, files[index]);
      if (token !== svgToken || shownFile !== key || currentMode() !== mode) return;
      svgHost.replaceChildren();
      if (!svg) {
        fallback.hidden = false;
        animation.hidden = true;
        return;
      }
      svgHost.append(svg.cloneNode(true));
      animation.hidden = true;
      fallback.hidden = true;
    }
    setMotion(paused);
  };

  const loadTrack = async (mode, shouldPlay) => {
    const tracks = tracksFor(mode);
    missing = false;
    if (!tracks.length) {
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      return;
    }
    indexes[mode] = ((indexes[mode] % tracks.length) + tracks.length) % tracks.length;
    const src = fileUrl("music", mode, tracks[indexes[mode]]);
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
    const entered = shownMode !== mode;
    shownMode = mode;
    fillSelect(mode);
    syncAnimations();
    if (entered) loadTrack(mode, wantsPlay);
    applyLabels();
  };

  const fixCredits = () => {
    const credits = document.getElementById("footerCredits");
    if (credits && credits.textContent.includes("GenPass")) {
      credits.textContent = credits.textContent.replaceAll("GenPass", "Pomodoro");
    }
  };

  playBtn.addEventListener("click", async () => {
    const mode = currentMode();
    if (mode === "focus" || playBtn.disabled) return;
    if (!audio.paused) {
      wantsPlay = false;
      audio.pause();
      applyLabels();
      return;
    }
    wantsPlay = true;
    await loadTrack(mode, true);
  });

  select.addEventListener("change", async () => {
    const mode = currentMode();
    const next = Number(select.value);
    if (!Number.isInteger(next)) return;
    indexes[mode] = next;
    await loadTrack(mode, wantsPlay);
  });

  volume.addEventListener("input", () => {
    const value = clamp(Number(volume.value) || 0, 0, 1);
    audio.volume = value;
    saveVolume(value);
  });

  audio.addEventListener("ended", async () => {
    const mode = currentMode();
    const tracks = tracksFor(mode);
    if (tracks.length < 2 || !wantsPlay) return;
    indexes[mode] = (indexes[mode] + 1) % tracks.length;
    fillSelect(mode);
    await loadTrack(mode, true);
  });

  audio.addEventListener("play", applyLabels);
  audio.addEventListener("pause", applyLabels);
  audio.addEventListener("error", () => {
    if (!audio.getAttribute("src")) return;
    missing = true;
    wantsPlay = false;
    applyLabels();
  });

  volume.value = String(readVolume());
  audio.volume = Number(volume.value);

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
      if (currentMode() !== "focus") syncAnimations();
    }).observe(statusBadge, { attributes: true, attributeFilter: ["class"] });
  }
  [shortInput, longInput].forEach((input) => {
    if (!input) return;
    input.addEventListener("input", () => {
      if (currentMode() !== "focus") syncAnimations();
    });
  });

  const credits = document.getElementById("footerCredits");
  if (credits) {
    fixCredits();
    new MutationObserver(fixCredits).observe(credits, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  }

  const readList = (url, target, onLoad) => {
    fetch(url, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!data || typeof data !== "object" || Array.isArray(data)) return;
        target.short = Array.isArray(data.short) ? data.short : [];
        target.long = Array.isArray(data.long) ? data.long : [];
        onLoad();
      })
      .catch(() => {});
  };

  readList(new URL("media/music/playlist.json", document.baseURI).href, playlists, () => {
    const mode = currentMode();
    if (mode === "focus") return;
    fillSelect(mode);
    if (wantsPlay) loadTrack(mode, true);
  });
  readList(new URL("media/animations/animations.json", document.baseURI).href, animations, () => {
    if (currentMode() !== "focus") syncAnimations();
  });
  sync();
})();
