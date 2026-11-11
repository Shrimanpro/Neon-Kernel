<div align="center">

# 🌌 NEON KERNEL
### The Digital Garden of a Systems Wizard

![Framework](https://img.shields.io/badge/Framework-React-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Style](https://img.shields.io/badge/Style-Tailwind-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Game](https://img.shields.io/badge/Game-Godot-478CBF?style=for-the-badge&logo=godot-engine&logoColor=white)
![Vibe](https://img.shields.io/badge/Vibe-Synthwave-ff00ff?style=for-the-badge)

</div>

---

## ⚡ System Status
**Neon Kernel** is my personal portfolio and experimental sandbox. 
It showcases projects focused on **systems programming, performance, and low-level software design**.

I prioritize understanding how software behaves *at runtime*—memory constraints, execution context, and speed—rather than treating systems as black boxes.

> "Abstractions are earned, not assumed."

## 💎 Core Philosophy

| Directive | Description |
| :--- | :--- |
| **Performance by Design** | Speed is a feature. Latency is the enemy. |
| **Control over Convenience** | Manual memory management teaches you more than a GC ever will. |
| **Transparency** | Understand the machine. Don't fear the segfault. |

## 🛠️ Tech Stack (The Engine)

- **Frontend:** `React` + `Framer Motion` (High-FPS animations)
- **Styling:** `Tailwind CSS` (Utility-first for speed)
- **Backend / Systems:** `C++` `Python` `FastAPI`
- **Game:** `Godot` (HTML5 / WebAssembly export)
- **Tooling:** `Arch Linux` `Neovim` `Git`

## 📡 Features (Modules)
- [x] **Project Grid:** Interactive modals with synthwave aesthetics.
- [x] **Terminal Interface:** CLI-style narrative and introspection for power users.
- [x] **Responsive:** Optimized layout for both desktop and mobile viewports.
- [x] **Game Mode:** A floating *"Bored?"* button above the terminal types out an invite on hover and launches my Godot game, playable right in the browser.

## 🚀 Boot Sequence (Installation)

To deploy this unit locally:

```bash
# Clone the repository
git clone https://github.com/Shrimanpro/neon-kernel.git
cd neon-kernel

# Install dependencies
npm install

# Ignite
npm run dev
```

The game is served at `/web/` in dev. To ship a production build:

```bash
npm run build     # outputs to dist/, with the game copied to dist/web/
npm run preview   # serve the build locally
```

## 🎮 Updating the Game

The Godot HTML5 export lives in `game/web/`. To update it, re-export from Godot into that folder (keep the export name `index`). A small Vite plugin in `vite.config.js` serves it at `/web/` during development and copies it to `dist/web/` on build, skipping Godot's `.import` files.

The current export has threads disabled, so no special COOP/COEP headers are needed on the host. If you export with threads enabled, the host must send those headers.

## 📜 License
MIT License.

<div align="center">
*"Running on high caffeine and low latency."*
</div>

---


