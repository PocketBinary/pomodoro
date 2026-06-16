<div align="center">
  <br />
  <div align="center">
  <br />
  <table>
    <tr>
      <td><img src="pomodoro.png" alt="Pomodoro Timer Logo" width="48" height="48" /></td>
      <td><h1>Pomodoro</h1></td>
    </tr>
  </table>
  <p><strong>Simple Focus Timer</strong> — Stay focused, track progress, get things done.</p>
  <br />

  <!-- Badges Row -->
  <a href="https://pages.github.com/" target="_blank">
    <img src="https://img.shields.io/badge/GitHub%20Pages-Live-222?style=for-the-badge&logo=github" alt="GitHub Pages" />
  </a>
  &nbsp;
  <a href="LICENSE" target="_blank">
    <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
  </a>
  &nbsp;
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

  <!-- PWA Badge -->
  <img src="https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white" alt="PWA Ready" />
  &nbsp;
  <img src="https://img.shields.io/badge/A11y-WCAG%202.1%20AA-blue?style=for-the-badge&logo=accessibility&logoColor=white" alt="WCAG 2.1 AA Accessibility" />
  &nbsp;
  <img src="https://img.shields.io/badge/SEO-Optimized-orange?style=for-the-badge&logo=google&logoColor=white" alt="SEO Optimized" />

<br /><br />

  <!-- Quick Links -->

<a href="#-fonctionnalites">Fonctionnalités</a>
&nbsp;·&nbsp;
<a href="#-demo">Démo</a>
&nbsp;·&nbsp;
<a href="#-structure-du-projet">Structure</a>
&nbsp;·&nbsp;
<a href="#-installation">Installation</a>
&nbsp;·&nbsp;
<a href="#-accessibilite">Accessibilité</a>
&nbsp;·&nbsp;
<a href="#-securite">Sécurité</a>

</div>

<br />

---

## ✨ Fonctionnalités

<div align="center">

|         🎯 Focus          |     ⏸️ Pauses     |        📊 Stats        |       🔊 Audio       |  🔔 Notifications   |
| :-----------------------: | :---------------: | :--------------------: | :------------------: | :-----------------: |
| Sessions personnalisables | Courtes & longues | Compteur + temps total | Bip sonore optionnel | Navigateur (opt-in) |

</div>

- **⏱️ Timer Pomodoro** avec trois modes : Focus, Short Break, Long Break
- **💾 Sauvegarde automatique** de l'état dans le navigateur (localStorage)
- **🔄 Reprise intelligente** après rechargement de page
- **🎛️ Paramètres ajustables** : durée des sessions, pauses, nombre de cycles
- **📈 Indicateur visuel** de progression (anneau SVG animé)
- **📱 Interface responsive** — fonctionne sur desktop, tablette et mobile
- **🌐 PWA** — installable comme application native
- **🌍 SEO optimisé** — JSON-LD, Open Graph, Twitter Cards, sitemap
- **♿ Accessible** — navigation clavier, screen readers, reduced motion

<br />

---

## 🚀 Démo

👉 **[Voir la démo en direct](https://pocketbinary.github.io/pomodoro/)**

<br />

---

## 📁 Structure du projet

```text
pomodoro/
├── 📄 index.html          # Page principale (HTML5 sémantique + SEO)
├── 📜 script.js           # Logique timer (vanilla JS, single file)
├── 🎨 pomodoro.png        # Logo, favicon & image Open Graph
├── 📋 manifest.json       # Configuration PWA
├── 🤖 robots.txt          # Directives crawl pour les moteurs
└── 🗺️ sitemap.xml         # Indexation SEO
├── 📄 LICENSE
└── 📄 README.md
```

### Détails techniques

| Aspect            | Implémentation                          |
| ----------------- | --------------------------------------- |
| **Framework**     | Aucun — vanilla HTML5, CSS3, JavaScript |
| **Styling**       | Tailwind CSS via CDN                    |
| **State**         | localStorage avec validation de schéma  |
| **Audio**         | Web Audio API (oscillateurs natifs)     |
| **Notifications** | Web Notifications API                   |
| **Progression**   | SVG `stroke-dashoffset` animé           |
| **PWA**           | Web App Manifest + icônes               |

<br />

---

## 🛠️ Installation

### Option 1 : Local (développement)

```bash
# Clone le dépôt
git clone https://github.com/PocketBinary/pomodoro.git
cd pomodoro

# Ouvre dans le navigateur
open index.html


```

## ♿ Accessibilité

Ce projet respecte les standards **WCAG 2.1 niveau AA** :

- **Navigation clavier complète** — Tab, Shift+Tab, Entrée, Espace, flèches
- **Pattern ARIA tablist** sur le sélecteur de mode (flèches ← → pour changer)
- **Progressbar ARIA** sur l'anneau de progression (valeur annoncée aux screen readers)
- **Live regions** pour les annonces vocales (démarrage, pause, fin de session)
- **Skip link** pour sauter au contenu principal
- **Focus visible** renforcé sur tous les éléments interactifs
- **Reduced motion** respecté (`prefers-reduced-motion`)
- **Contraste** vérifié sur tous les textes

<br />

---

## 🔒 Sécurité

| Mesure                            | Description                                                                   |
| --------------------------------- | ----------------------------------------------------------------------------- |
| **CSP (Content Security Policy)** | `default-src 'self'` avec exceptions contrôlées pour le CDN Tailwind          |
| **X-Frame-Options**               | `DENY` — empêche le clickjacking                                              |
| **X-Content-Type-Options**        | `nosniff` — empêche le MIME sniffing                                          |
| **Referrer Policy**               | `strict-origin-when-cross-origin` — minimise les fuites de données            |
| **Validation localStorage**       | Schéma versionné avec typage strict — évite les crashs sur données corrompues |
| **Pas de `eval()`**               | Aucune exécution dynamique de code                                            |
| **Pas de `innerHTML`**            | Tout contenu inséré via `textContent`                                         |

<br />

---

## 🔍 SEO

| Élément              | Implémentation                                             |
| -------------------- | ---------------------------------------------------------- |
| **Meta description** | Présente et optimisée (160 caractères)                     |
| **Canonical URL**    | Évite le contenu dupliqué                                  |
| **Open Graph**       | `og:title`, `og:description`, `og:image`, `og:url`         |
| **Twitter Cards**    | `twitter:card`, `twitter:title`, `twitter:image`           |
| **JSON-LD**          | Structured data `WebApplication` pour Google Rich Snippets |
| **robots.txt**       | `index, follow` avec directives Rich Snippets              |
| **sitemap.xml**      | Indexation automatique des moteurs de recherche            |
| **Theme color**      | Adaptatif light/dark mode                                  |

<br />

---

## 📝 Personnalisation

### Changer les durées par défaut

Modifie les valeurs dans `script.js` :

```javascript
const getDefaultState = () => ({
  settings: {
    focus: 25, // minutes de focus
    shortBreak: 5, // minutes de pause courte
    longBreak: 15, // minutes de pause longue
    sessions: 4, // sessions avant pause longue
  },
  // ...
});
```

### Changer le son de notification

Dans `script.js`, modifie les fréquences du bip :

```javascript
[880, 660, 880].forEach((freq, index) => {
  // 880 Hz = La5, 660 Hz = Mi5
  // Remplace par d'autres fréquences
});
```

## 📄 Licence

Ce projet est sous licence **MIT**.

```
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
  <p>Fabriqué avec ❤️ et beaucoup de café ☕</p>
  <p><sub>N'oublie pas de faire une pause — c'est le principe même du Pomodoro 🍅</sub></p>
  <br />
</div>

