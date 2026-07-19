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

[![HTML](https://img.shields.io/badge/HTML-%23E34F26.svg?logo=html5&logoColor=white)](#)   [![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=000)](#)  [![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-%2338B2AC.svg?logo=tailwind-css&logoColor=white)](#)  [![Visual Studio Code](https://custom-icon-badges.demolab.com/badge/Visual%20Studio%20Code-0078d7.svg?logo=visualstudiocode&logoColor=white)](#) ![Offline Ready](https://img.shields.io/badge/PWA-offline%20ready-blueviolet) <br /><br />

[![ReadMe](https://img.shields.io/badge/ReadMe-018EF5?logo=readme&logoColor=fff)](#)
[![MIT license](https://img.shields.io/badge/License-MIT-blue.svg)](https://lbesson.mit-license.org/)
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

## Fonctionnalités

<div align="center">

| Focus | Pauses | Stats | Audio | Notifications |
| :---: | :----: | :---: | :---: | :-----------: |
| Sessions personnalisables | Courtes & longues | Compteur + temps total | Bip sonore optionnel | Navigateur opt-in |

</div>

- **Timer Pomodoro** avec trois modes : Focus, Pause courte, Pause longue
- **Sauvegarde automatique** de l'état dans le navigateur avec `localStorage`
- **Reprise intelligente** après rechargement de page
- **Paramètres ajustables** : durée des sessions, pauses et nombre de cycles
- **Indicateur visuel** de progression avec anneau SVG animé
- **Interface responsive** pour desktop, tablette et mobile
- **Thèmes clair/sombre** avec préférence sauvegardée
- **Switch EN/FR** avec préférence sauvegardée
- **Support PWA** — installable comme une application native
- **SEO optimisé** — JSON-LD, Open Graph, Twitter Cards et sitemap
- **Accessible** — navigation clavier, screen readers et reduced motion

<br />

---

## Démo

**[Voir la démo en direct](https://pocketbinary.github.io/pomodoro/)**

<br />

---

## Structure du projet

```text
pomodoro/
├── index.html          # Page principale avec HTML sémantique et SEO
├── script.js           # Logique timer, état UI et préférences
├── sw.js               # Service worker pour PWA/offline
├── pomodoro.png        # Logo, favicon et image Open Graph
├── pomodoro-192.png    # Icône PWA 192x192
├── pomodoro-512.png    # Icône PWA 512x512
├── manifest.json       # Manifest PWA
├── robots.txt          # Directives crawl pour les moteurs
├── sitemap.xml         # Sitemap SEO
├── LICENSE             # Licence MIT
├── README.md           # Documentation anglaise
└── README_FR.md        # Documentation française
```

### Détails techniques

| Aspect | Implémentation |
| ------ | -------------- |
| **Framework** | Aucun — HTML5, CSS3 et JavaScript vanilla |
| **Styling** | Tailwind CSS via CDN + tokens CSS personnalisés |
| **State** | `localStorage` avec validation de schéma |
| **Audio** | Web Audio API avec oscillateurs natifs |
| **Notifications** | Web Notifications API |
| **Progression** | SVG `stroke-dashoffset` animé |
| **PWA** | Web App Manifest, service worker et icônes |

<br />

---

## Installation

### Option 1 : Développement local

```bash
# Cloner le dépôt
git clone https://github.com/PocketBinary/pomodoro.git
cd pomodoro

# Servir le dossier localement pour tester la PWA
npx serve .
```

Ouvre ensuite l'URL locale affichée par la commande.

### Option 2 : GitHub Pages

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/PocketBinary/pomodoro.git
git push -u origin main
```

Puis active GitHub Pages : **Settings → Pages → Source: Deploy from a branch → main → / (root)**.

<br />

---

## Accessibilité

Ce projet vise les bonnes pratiques **WCAG 2.1 AA** :

- Navigation clavier complète avec Tab, Shift+Tab, Entrée, Espace et flèches
- Pattern ARIA tablist sur le sélecteur de mode
- Progressbar ARIA sur l'anneau de progression
- Live regions pour les annonces du timer
- Skip link pour aller directement au contenu principal
- Focus visible renforcé sur les éléments interactifs
- Support de `prefers-reduced-motion`
- Contrastes vérifiés pour la lisibilité des textes

<br />

---

## Sécurité

| Mesure | Description |
| ------ | ----------- |
| **CSP (Content Security Policy)** | `default-src 'self'` avec exceptions contrôlées pour le CDN Tailwind |
| **X-Content-Type-Options** | `nosniff` pour réduire le risque de MIME sniffing |
| **Referrer Policy** | `strict-origin-when-cross-origin` pour limiter les fuites de données |
| **Validation localStorage** | Schéma versionné avec typage strict |
| **Pas de `eval()`** | Aucune exécution dynamique de code |
| **Pas de `innerHTML`** | Les textes UI sont mis à jour avec `textContent` |

<br />

---

## SEO

| Élément | Implémentation |
| ------- | -------------- |
| **Meta description** | Présente et optimisée |
| **Canonical URL** | Évite le contenu dupliqué |
| **Open Graph** | `og:title`, `og:description`, `og:image`, `og:url` |
| **Twitter Cards** | `twitter:card`, `twitter:title`, `twitter:image` |
| **JSON-LD** | Données structurées `WebApplication` |
| **robots.txt** | Directives d'indexation |
| **sitemap.xml** | Découverte par les moteurs de recherche |
| **Theme color** | Adaptatif selon les thèmes clair et sombre |

<br />

---

## Personnalisation

### Changer les durées par défaut

Modifie les réglages par défaut dans `script.js` :

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

Modifie les fréquences du bip dans `script.js` :

```javascript
[880, 660, 880].forEach((freq, index) => {
  // 880 Hz = La5, 660 Hz = Mi5
  // Remplace par d'autres fréquences si besoin.
});
```

<br />

---

## Licence

Ce projet est sous licence **MIT**.

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
  <p>Fabriqué avec soin et beaucoup de café.</p>
  <p><sub>N'oublie pas de faire une pause — c'est le principe même du Pomodoro.</sub></p>
  <br />
</div>
