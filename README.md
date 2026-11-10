<div align="center">
  <div>
    <table style="display: flex; justify-content: center; align-items: center;">
      <tr>
        <td><img src="icons/pomodoro.png" alt="Pomodoro Timer Logo" width="64" height="64" /></td>
        <td><h1>Pomodoro</h1></td>
      </tr>
    </table>
  </div>
  <p><strong>Simple Focus Timer</strong> — Stay focused, track progress, get things done.</p>
  <p><a href="README_FR.md">Lire la documentation en français</a></p>
  <br />

  <!-- Badges Row -->
  [![HTML](https://img.shields.io/badge/HTML5-%23E34F26.svg?logo=html5&logoColor=white)](#)
  [![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=000)](#)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-%2338B2AC.svg?logo=tailwind-css&logoColor=white)](#)
  [![Visual Studio Code](https://custom-icon-badges.demolab.com/badge/Visual%20Studio%20Code-0078d7.svg?logo=visualstudiocode&logoColor=white)](#)
  ![Offline Ready](https://img.shields.io/badge/PWA-offline%20ready-blueviolet)
  <br /><br />

  [![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
  [![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-121013?logo=github&logoColor=white)](#)
  ![Open Source? Yes!](https://badgen.net/badge/Open%20Source%20%3F/Yes%21/blue?icon=github)
  <br />
  <br />
  <a href="https://pocketbinary.github.io/pomodoro/" rel="nofollow">
    <img src="https://www.w3.org/WAI/wcag21/wcag2.1AA-blue-v.svg" alt="WCAG 2.1 AA Accessibility" width="1000px" height="30px">
  </a>
</div>

<br />
<br />

---

## Features

<div align="center">

| Focus | Breaks & Music | Daily Stats | Audio Beep | Notifications |
| :---: | :------------: | :---------: | :--------: | :-----------: |
| Custom sessions | 5 Zen tracks + 4 SVG animations | Counters + total focus time | Synthesized Web Audio chime | Native browser opt-in |

</div>

- **3 Pomodoro Timer Modes**: Focus, Short Break, and Long Break with configurable cycles.
- **Ambient Break Player**: 5 calming Zen music tracks (`.mp3`) and 4 meditative SVG animations, automatically synchronized with break timer playback.
- **Dedicated Reset Actions**:
  - **Timer Reset**: Resets only the active countdown without erasing daily progress or changing mode.
  - **Settings Reset**: Restores duration inputs to defaults (`25 / 5 / 15 / 4`) and sound enabled, protected by a modal confirmation dialog.
  - **Daily Stats Reset**: Clears today's completed sessions and total focus time, protected by confirmation and equipped with an instant **Undo toast**.
- **Tablet Landscape Optimization**: Dedicated 2-column landscape layout without vertical overflow, rotation unlocked in PWA manifest, and discreet portrait orientation banner.
- **Automatic State Persistence**: Safe `localStorage` schema with strict type validation; resumes smoothly after tab reload or sleep.
- **Responsive & Themed**: Harmonized Light / Dark themes across all UI components (including dropdown menus) and full mobile / tablet / desktop support.
- **Bilingual Interface**: Instant English / French switching without page reload.
- **Progressive Web App (PWA)**: Installable like a native app, driven by a resilient Service Worker (`pomodoro-cache-v8`) for complete offline usage.
- **Accessible (WCAG 2.1 AA)**: Full keyboard navigation (WAI-ARIA tablist pattern, <kbd>Space</kbd> toggle), screen reader live announcements, and `prefers-reduced-motion` compliance.
- **SEO Ready**: JSON-LD semantic metadata, Open Graph cards, Twitter Cards, robots.txt, and sitemap.

<br />

---

## Live Demo

**[Explore the live application on GitHub Pages](https://pocketbinary.github.io/pomodoro/)**

<br />

---

## Modern Project Structure

Organized following modern static PWA standards with separation of concerns:

```text
pomodoro/
├── index.html              # Main semantic HTML5 page with accessible structure
├── manifest.json           # Web App Manifest for native installation
├── sw.js                   # Service Worker (Cache-First assets & Network-First HTML)
├── robots.txt              # Search engine crawl directives
├── sitemap.xml             # XML sitemap for SEO discovery
├── LICENSE                 # MIT open-source license
├── README.md               # English project documentation
├── README_FR.md            # French project documentation
│
├── css/                    # Stylesheet architecture
│   └── style.css           # Design tokens, light/dark themes, components, tablet rules
│
├── js/                     # Application scripts with comprehensive FR comments
│   ├── app.js              # Timer engine, state management, Web Audio API, a11y
│   └── break-media.js      # Break ambiance player (audio tracks and SVG animations)
│
├── fonts/                  # Self-hosted web fonts for privacy, offline & CSP compliance
│   ├── archivo-latin.woff2
│   ├── archivo-latin-ext.woff2
│   ├── chivo-mono-latin.woff2
│   └── chivo-mono-latin-ext.woff2
│
├── icons/                  # Application and PWA icons
│   ├── pomodoro.png        # Favicon and standard brand logo
│   ├── pomodoro-192.png    # 192x192 PWA homescreen icon
│   └── pomodoro-512.png    # 512x512 PWA splashscreen icon
│
└── media/                  # Relaxing break media assets
    ├── media.json          # Tracklist and animation catalog configuration
    ├── README.md           # Break media documentation
    ├── zen calming.mp3
    ├── zen garden.mp3
    ├── zen music 01.mp3
    ├── zen music 02.mp3
    ├── zen piano.mp3
    ├── Zen Ying-Yang.svg
    ├── ZenMan.svg
    ├── ZenNenuphar.svg
    └── ZENWoman.svg
```

### Technical Architecture

| Area | Implementation |
| ---- | -------------- |
| **Framework** | None — Vanilla HTML5, CSS3, and JavaScript ES6+ |
| **Styling** | Tailwind CSS CDN + custom design tokens in `css/style.css` |
| **State** | `localStorage` with JSON schema validation & self-healing fallback |
| **Audio** | Native Web Audio API sine oscillator synthesis + HTML5 Audio for ambient tracks |
| **Offline & PWA** | Service Worker (`Cache-First` for static assets, `Network-First` for HTML) |
| **Accessibility** | WAI-ARIA tablist pattern, `<dialog>` modal, live regions, WCAG 2.1 AA |

<br />

---

## Getting Started

### Local Development

No build step or bundler is required. Simply serve the project folder using any static HTTP server:

```bash
# Using npx serve
npx serve . -l 3000

# Or with Python 3
python -m http.server 3000
```

Open your browser at `http://localhost:3000`.

### Keyboard Shortcuts

- <kbd>Space</kbd> : Toggle Start / Pause (from anywhere in the application).
- <kbd>←</kbd> / <kbd>→</kbd> or <kbd>↑</kbd> / <kbd>↓</kbd> : Navigate timer modes (Focus, Short Break, Long Break).
- <kbd>Home</kbd> / <kbd>End</kbd> : Jump to the first or last timer mode.
- <kbd>Tab</kbd> / <kbd>Shift + Tab</kbd> : Navigate through steppers, buttons, and switches.

<br />

---

## License

This project is open-source and released under the [MIT License](LICENSE).
