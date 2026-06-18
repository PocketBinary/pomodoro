<div align="center">
  <div>
    <table style="display: flex; justify-content: center; align-items: center;">
      <tr>
        <td><img src="pomodoro.png" alt="Pomodoro Timer Logo" width="64" height="64" /></td>
        <td><h1>Pomodoro</h1></td>
      </tr>
    </table>
  </div>
  <p><strong>Simple Focus Timer</strong> — Stay focused, track progress, get things done.</p>
  <p><a href="README_FR.md">Lire en français</a></p>
  <br />

  <!-- Badges Row -->

  <a href="https://developer.mozilla.org/docs/Web/HTML" target="_blank">
    <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  </a>
  &nbsp;
  <a href="https://developer.mozilla.org/docs/Web/JavaScript" target="_blank">
    <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  </a>
  &nbsp;
  <a href="https://tailwindcss.com/" target="_blank">
    <img src="https://img.shields.io/badge/Tailwind_CSS-38BDF8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  </a>
  <br /><br />
  <a href="https://pages.github.com/" target="_blank">
    <img src="https://img.shields.io/badge/GitHub%20Pages-Live-222?style=for-the-badge&logo=github" alt="GitHub Pages" />
  </a>
  &nbsp;
  <a href="LICENSE" target="_blank">
    <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
  </a>
  <br /><br />

  <!-- PWA Badge -->
  <img src="https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA Ready" />
  &nbsp;
  <img src="https://img.shields.io/badge/A11y-WCAG%202.1%20AA-blue?style=for-the-badge&logo=accessibility&logoColor=white" alt="WCAG 2.1 AA Accessibility" />
  &nbsp;
  <img src="https://img.shields.io/badge/SEO-Optimized-orange?style=for-the-badge&logo=google&logoColor=white" alt="SEO Optimized" />

  <br />
</div>

<br />

---

## Features

<div align="center">

| Focus | Breaks | Stats | Audio | Notifications |
| :---: | :----: | :---: | :---: | :-----------: |
| Custom sessions | Short & long | Counter + total time | Optional beep | Browser opt-in |

</div>

- **Pomodoro timer** with three modes: Focus, Short Break, Long Break
- **Automatic saving** of app state in the browser with `localStorage`
- **Smart resume** after page reloads
- **Adjustable settings**: session lengths, breaks and cycle count
- **Visual progress indicator** with an animated SVG ring
- **Responsive interface** for desktop, tablet and mobile
- **Light/Dark themes** with persisted preference
- **English/French UI switch** with persisted preference
- **PWA support** — installable like a native app
- **SEO optimized** — JSON-LD, Open Graph, Twitter Cards and sitemap
- **Accessible** — keyboard navigation, screen readers and reduced motion

<br />

---

## Demo

**[View the live demo](https://pocketbinary.github.io/pomodoro/)**

<br />

---

## Project Structure

```text
pomodoro/
├── index.html          # Main page with semantic HTML and SEO metadata
├── script.js           # Timer logic, UI state and preferences
├── sw.js               # Service worker for PWA/offline support
├── pomodoro.png        # Logo, favicon and Open Graph image
├── pomodoro-192.png    # 192x192 PWA icon
├── pomodoro-512.png    # 512x512 PWA icon
├── manifest.json       # PWA manifest
├── robots.txt          # Search engine crawl directives
├── sitemap.xml         # SEO sitemap
├── LICENSE             # MIT license
├── README.md           # English documentation
└── README_FR.md        # French documentation
```

### Technical Details

| Area | Implementation |
| ---- | -------------- |
| **Framework** | None — vanilla HTML5, CSS3 and JavaScript |
| **Styling** | Tailwind CSS via CDN plus custom CSS tokens |
| **State** | `localStorage` with schema validation |
| **Audio** | Web Audio API with native oscillators |
| **Notifications** | Web Notifications API |
| **Progress** | Animated SVG `stroke-dashoffset` |
| **PWA** | Web App Manifest, service worker and icons |

<br />

---

## Installation

### Option 1: Local Development

```bash
# Clone the repository
git clone https://github.com/PocketBinary/pomodoro.git
cd pomodoro

# Serve the folder locally for PWA testing
npx serve .
```

Then open the local URL shown by the command.

### Option 2: GitHub Pages

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/PocketBinary/pomodoro.git
git push -u origin main
```

Then enable GitHub Pages: **Settings → Pages → Source: Deploy from a branch → main → / (root)**.

<br />

---

## Accessibility

This project aims to follow **WCAG 2.1 AA** practices:

- Full keyboard navigation with Tab, Shift+Tab, Enter, Space and arrow keys
- ARIA tablist pattern on the mode selector
- ARIA progressbar on the progress ring
- Live regions for timer announcements
- Skip link to jump to the main content
- Strong visible focus on interactive elements
- `prefers-reduced-motion` support
- Checked color contrast for readable text

<br />

---

## Security

| Measure | Description |
| ------- | ----------- |
| **CSP (Content Security Policy)** | `default-src 'self'` with controlled exceptions for Tailwind CDN |
| **X-Content-Type-Options** | `nosniff` to reduce MIME sniffing risk |
| **Referrer Policy** | `strict-origin-when-cross-origin` to reduce data leakage |
| **localStorage validation** | Versioned schema with strict type checks |
| **No `eval()`** | No dynamic code execution |
| **No `innerHTML`** | UI content is updated with `textContent` |

<br />

---

## SEO

| Element | Implementation |
| ------- | -------------- |
| **Meta description** | Present and optimized |
| **Canonical URL** | Avoids duplicate content |
| **Open Graph** | `og:title`, `og:description`, `og:image`, `og:url` |
| **Twitter Cards** | `twitter:card`, `twitter:title`, `twitter:image` |
| **JSON-LD** | `WebApplication` structured data |
| **robots.txt** | Indexing directives |
| **sitemap.xml** | Search engine discovery |
| **Theme color** | Adapts to light and dark themes |

<br />

---

## Customization

### Change Default Durations

Edit the default settings in `script.js`:

```javascript
const getDefaultState = () => ({
  settings: {
    focus: 25, // focus minutes
    shortBreak: 5, // short break minutes
    longBreak: 15, // long break minutes
    sessions: 4, // sessions before a long break
  },
  // ...
});
```

### Change the Notification Sound

Edit the beep frequencies in `script.js`:

```javascript
[880, 660, 880].forEach((freq, index) => {
  // 880 Hz = A5, 660 Hz = E5
  // Replace with other frequencies if needed.
});
```

<br />

---

## License

This project is licensed under the **MIT License**.

```text
MIT License

Copyright (c) 2026 PocketBinary

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

<br />

---

<div align="center">
  <br />
  <p>Made with care and plenty of coffee.</p>
  <p><sub>Remember to take a break — that is the whole point of Pomodoro.</sub></p>
  <br />
</div>
