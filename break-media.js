(() => {
  const STORAGE_KEY = "pomodoro-break-media-v1";
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

  if (!sloganEl || !atmosphere || !playBtn || !select || !pickLabel || !volume || !volumeLabel || !audio || !animation || !fallback || !player || !switcher) {
    return;
  }

  let playlists = { short: [], long: [] };
  let animations = { short: [], long: [] };
  let indexes = { short: 0, long: 0 };
  let wantsPlay = false;
  let missing = false;
  let shownMode = null;
  let animTimer = 0;

  const lang = () => (document.documentElement.lang === "fr" ? "fr" : "en");
  const copy = () => ui[lang()];

  const currentMode = () => {
    const selected = switcher.querySelector('[aria-selected="true"]');
    const value = selected && selected.dataset.mode;
    return value === "short" || value === "long" ? value : "focus";
  };

  const safeName = (value, extensions) => {
    if (typeof value !== "string") return null;
    const name = value.trim();
    const pattern = new RegExp(`^[A-Za-z0-9][A-Za-z0-9 _.-]{0,80}\\.(${extensions})$`, "i");
    if (!pattern.test(name) || name.includes("..")) return null;
    return name;
  };

  const fileUrl = (folder, mode, name) =>
    new URL(`media/${folder}/${mode}/${encodeURIComponent(name)}`, document.baseURI).href;

  const readVolume = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      const value = parsed && Number(parsed.volume);
      if (Number.isFinite(value)) return Math.min(1, Math.max(0, value));
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
    (playlists[mode] || []).map((name) => safeName(name, "mp3|ogg|wav|m4a")).filter(Boolean);

  const svgsFor = (mode) =>
    (animations[mode] || []).map((name) => safeName(name, "svg")).filter(Boolean);

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

  const showAnimation = (mode) => {
    window.clearInterval(animTimer);
    animTimer = 0;
    const files = svgsFor(mode);
    if (!files.length) {
      animation.hidden = true;
      animation.removeAttribute("src");
      fallback.hidden = false;
      return;
    }
    let index = 0;
    const paint = () => {
      animation.hidden = false;
      fallback.hidden = true;
      animation.src = fileUrl("animations", mode, files[index]);
    };
    paint();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (files.length > 1 && !reduce) {
      animTimer = window.setInterval(() => {
        index = (index + 1) % files.length;
        paint();
      }, 12000);
    }
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
      window.clearInterval(animTimer);
      shownMode = "focus";
      applyLabels();
      return;
    }
    atmosphere.hidden = false;
    const entered = shownMode !== mode;
    shownMode = mode;
    fillSelect(mode);
    if (entered) {
      showAnimation(mode);
      loadTrack(mode, wantsPlay);
    }
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
    const value = Math.min(1, Math.max(0, Number(volume.value) || 0));
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

  animation.addEventListener("error", () => {
    animation.hidden = true;
    animation.removeAttribute("src");
    fallback.hidden = false;
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

  const credits = document.getElementById("footerCredits");
  if (credits) {
    fixCredits();
    new MutationObserver(fixCredits).observe(credits, {
      childList: true,
      characterData: true,
      subtree: true,
    });
  }

  const readList = (url, target) => {
    fetch(url, { cache: "no-store" })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!data || typeof data !== "object" || Array.isArray(data)) return;
        target.short = Array.isArray(data.short) ? data.short : [];
        target.long = Array.isArray(data.long) ? data.long : [];
        const mode = currentMode();
        if (mode === "focus") return;
        fillSelect(mode);
        showAnimation(mode);
        if (wantsPlay) loadTrack(mode, true);
      })
      .catch(() => {});
  };

  readList(new URL("media/music/playlist.json", document.baseURI).href, playlists);
  readList(new URL("media/animations/animations.json", document.baseURI).href, animations);
  sync();
})();
