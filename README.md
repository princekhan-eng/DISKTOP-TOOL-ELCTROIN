# DevPrompt Studio

> **Local developer workspace for prompts, UI plans and architecture flows.**  
> Electron + React + TypeScript + SQLite | Soft light theme | Local-first

---

## 🎯 Overview

DevPrompt Studio is a local-first desktop and web developer productivity workspace built according to the **DevPrompt Studio Product Blueprint v1.0**.

It allows developers to organize reusable prompts, define project rules and tech stack profiles, visually describe UI wireframes and multi-tier system flows, and merge selected inputs into clean, AI-ready prompts for pair programming with coding AIs (like Antigravity, Claude, and ChatGPT).

DevPrompt Studio is deterministic:  
$$\text{Selected Project Data} + \text{Rules} + \text{Templates} + \text{Task Details} = \text{Final AI Prompt}$$

---

## 🚀 Quick Start

### 1. Web Preview Mode (Instant Browser Workspace)
```bash
npm install
npm run dev
```
Open **[http://localhost:5173/](http://localhost:5173/)** in your browser.

### 2. Electron Desktop Application Mode
```bash
npm run electron:start
# or
npm run app
```

### 3. Production Build
```bash
npm run build
```

---

## 🧩 Primary Modules

| Module | Purpose |
| :--- | :--- |
| **Home / Projects** | Manage project workspaces (`StorePro`, etc.), recent items overview, workspace health status. |
| **Prompt Builder** | 20 structured topics (Task, Role, Scope, Stack, Data, UI, Security, Validation, Criteria) merged into a clean AI-ready prompt. |
| **UI Builder** | Visual block wireframe canvas (Headers, Sidebars, Stat Grids, Data Tables, Forms), live inspector, PNG image & markdown export. |
| **Architecture Builder** | Multi-tier flow sequence designer (UI -> Validation -> Service -> Repository -> SQLite), natural-language instructions converter. |
| **Prompt Library** | Reusable production prompts across 9 roles: Global Rules, Frontend, Backend, Database, Full Stack, UI/UX, Testing, Security, Reviewer. |
| **Project Profile** | Centralized project tech stack conventions, UI rules, testing standards, and forbidden patterns. |
| **Export History** | Complete local audit log of generated prompts, wireframes, and exported files with 1-click re-copying. |
| **Settings** | Theme toggle (Soft Light default, Dark Mode), SQLite database backups (JSON and raw `.sqlite` files), factory resets. |

---

## 🎨 Visual Design System

- **Palette**: Soft light theme (`#F7F9FC` background, `#FFFFFF` surfaces, `#0F172A` slate text, `#2563EB` muted blue accent).
- **Structure**: Border-first definition with subtle shadows and clean `8-12px` rounded radii.
- **Typography**: Inter / Segoe UI / System UI typography with high readability.

---

## 💾 Local-First Persistence

- Embedded **SQLite 3 engine** (`sql.js` WebAssembly) with automatic disk persistence and local storage backups.
- Zero mandatory cloud dependencies, accounts, or subscriptions.
- Full database backup and restore via JSON or binary `.sqlite` database files.
