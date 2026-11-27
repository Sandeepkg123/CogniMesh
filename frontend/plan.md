# CogniMesh Frontend — UI Redesign Plan

**Status:** ✅ Complete (P0–P5)
**Created:** 2026-11-25
**Scope:** `frontend/` — plus approved backend changes: §13.1, conversation delete, §13.3, and `/internal/credits`
**Design direction:** Linear-style premium dark, cobalt accent
**Stack:** React 19 + Vite 8 + Tailwind CSS 4.3 + shadcn/ui + CodeMirror 6

> This file is `frontend/plan.md`. It is the authoritative redesign plan and verification record.

### Hard constraints (non-negotiable)

1. **No git commits unless the user explicitly asks.** The user has asked for local feature commits.
2. **No pushes** to GitHub, Azure, or any remote. Not until explicitly told.
3. **No CI triggers.** `.github/workflows/deploy.yml` runs on push to `main` — we will not push.
4. **Verify by running the full stack in Docker locally**, not just `npm run dev`.
5. If commits are requested later: **split by feature**, conventional messages, never one mega-commit.
6. Never commit `.env`, `*firebase-adminsdk*.json`, `dist/`, or `node_modules/`.

---

## 0. Current state (baseline)

- 21 source files, ~1,600 lines, all UI in `frontend/src`.
- Tailwind 4.3 wired via `@tailwindcss/vite`; `index.css` is a single `@import "tailwindcss"`.
- No design tokens: `#0d0f14` hardcoded 12+ times across 6 files.
- No fonts loaded; default system stack.
- Indigo→violet gradient used on every primary element (user bubble, New Chat, send, active agent chip).
- Sidebar has two separate markup trees (collapsed and expanded) that have already drifted.
- Artifact panel returns `undefined` when empty, so the right pane mounts/unmounts abruptly.
- Monaco is imported eagerly for a 400px read-only viewer.
- Several controls are dead (suggested prompts, sidebar Login).

---

## 1. Goal & non-goals

### Goal
Rebuild the UI on a real design system so CogniMesh looks like a paid, opinionated product rather than a Tailwind template — without changing any Redux logic, feature functions, or API contracts.

### Definition of done
1. Zero raw hex colors in component files; all color comes from tokens.
2. One sidebar implementation, one message implementation, one composer.
3. Layout works at 375px, 768px, 1024px, 1440px, and 2560px without horizontal scroll.
4. Every visible control does something.
5. `npm run build` and `npm run lint` pass.
6. Keyboard-only user can log in, start a chat, send a message, open the artifact panel, and upgrade a plan.
7. The **entire stack runs locally via `docker compose`** at `http://localhost:8080` and every smoke test in §15.3 passes.
8. The agent tag survives a page refresh (proves §13.1 persistence works end to end).

### Non-goals (this pass)
- Streaming responses / SSE (separate backend project).
- Light mode (tokens are structured so it's a CSS-only follow-up).
- Email/password auth, i18n.
- Automated CI; local Playwright harnesses are used for verification.
- Redesigning the marketing/landing surface (there isn't one yet).

---

## 2. Locked decisions

| Decision | Choice |
|---|---|
| Visual direction | Linear-style premium dark |
| Accent | Cobalt `#3B6EF6`, flat — no gradients anywhere |
| Scope | Full redesign, all phases P0–P5 |
| Message column | Fluid, `max-w-[45rem]` (720px) on desktop, full width minus gutters below that |
| Sidebar conversation rows | No icons; title + active bar + hover actions |
| Agent picker | All 7, grouped EVERYDAY / CREATE |
| Light mode | Not in this pass |
| Code viewer | CodeMirror 6 (Monaco removed) |
| Components | shadcn/ui (copied into repo, owned) |
| Backend | §13.1 `agent`, conversation delete, §13.3 `failed`/credit pre-check, `/internal/credits` |

---

## 3. Design tokens

### 3.1 Color

| Token | Value | Use |
|---|---|---|
| `--background` | `#0A0A0B` | App canvas |
| `--card` | `#0D0D0F` | Sidebar, header, panels |
| `--popover` | `#141416` | Composer, dropdowns, cards |
| `--hover` | `#1A1A1D` | Row hover, ghost button hover |
| `--border` | `rgba(255,255,255,.07)` | Hairlines |
| `--border-strong` | `rgba(255,255,255,.11)` | Inputs, focused cards |
| `--foreground` | `#EDEDEF` | Primary text |
| `--muted-foreground` | `#A1A1A6` | Secondary text |
| `--fg-subtle` | `#8A8A92` | Tertiary / placeholders |
| `--fg-faint` | `#8A8A92` | Section labels, dividers' text |
| `--primary` | `#3B6EF6` | Accent, active states, send |
| `--primary-hover` | `#2F5FE0` | Accent hover |
| `--accent-soft` | `rgba(59,110,246,.12)` | Active row bg, agent pill bg |
| `--success` | `#2FBF71` | Success toast, copied state |
| `--warning` | `#E8A33D` | Low credits, rate limit |
| `--destructive` | `#E5484D` | Delete, errors |
| `--code-bg` | `#0F0F11` | Code blocks, CodeMirror |

### 3.2 Typography

Fonts: **Geist Variable** (UI) and **Geist Mono Variable** (code, credits, shortcuts), self-hosted via `@fontsource-variable`.

| Role | Size / line-height / tracking / weight |
|---|---|
| Display | 24 / 1.2 / -0.02em / 600 |
| H1 | 20 / 1.3 / -0.015em / 600 |
| H2 | 16 / 1.4 / -0.01em / 600 |
| Body | 14 / 1.6 / -0.006em / 400 |
| Body-sm | 13 / 1.5 / 0 / 400 |
| Caption | 12 / 1.4 / 0 / 400 |
| Micro | 11 / 1.3 / 0.01em / 500 |
| Mono | 12.5 / 1.5 / 0 / 400 |

Rules: no arbitrary `[13.5px]` values. Headings use `tracking-tight`. Markdown body inherits 14px.

### 3.3 Radius, spacing, elevation, motion

| Token | Value |
|---|---|
| Radius sm / md / lg / xl | 6 / 8 / 10 / 14 px |
| Spacing base | 4px; section gaps 8 / 12 / 16 / 24 / 32 |
| Control height sm / md / lg | 28 / 32 / 36 px |
| Header height | 56px |
| Row height (sidebar) | 34px |
| Shadow (popover only) | `0 12px 32px rgba(0,0,0,.45)` |
| Shadow (sheet/dialog) | `0 24px 64px rgba(0,0,0,.50)` |
| Focus ring | `0 0 0 2px #0A0A0B, 0 0 0 4px rgba(59,110,246,.6)` |
| Duration fast / base / slow | 120 / 180 / 260 ms |
| Easing | `cubic-bezier(0.2, 0, 0, 1)` |

Cards get **borders, not shadows**. Shadows only for floating layers. All motion respects `prefers-reduced-motion`.

### 3.4 `frontend/src/index.css` spec

```css
@import "tailwindcss";
@import "tw-animate-css";
@import "@fontsource-variable/geist";
@import "@fontsource-variable/geist-mono";

/* Tailwind must scan streamdown's dist for its utility classes */
@source "../node_modules/streamdown/dist/index.js";

@custom-variant dark (&:is(.dark *));

:root {
  --radius: 0.625rem;

  --background: #0a0a0b;
  --foreground: #ededef;
  --card: #0d0d0f;
  --card-foreground: #ededef;
  --popover: #141416;
  --popover-foreground: #ededef;
  --primary: #3b6ef6;
  --primary-foreground: #ffffff;
  --secondary: #1a1a1d;
  --secondary-foreground: #ededef;
  --muted: #141416;
  --muted-foreground: #a1a1a6;
  --accent: #1a1a1d;
  --accent-foreground: #ededef;
  --destructive: #e5484d;
  --border: rgba(255, 255, 255, 0.07);
  --input: rgba(255, 255, 255, 0.11);
  --ring: #3b6ef6;
  --sidebar: #0d0d0f;

  --fg-subtle: #8a8a92;
  --fg-faint: #8a8a92;
  --accent-soft: rgba(59, 110, 246, 0.12);
  --success: #2fbf71;
  --warning: #e8a33d;
  --code-bg: #0f0f11;
}

@theme inline {
  --font-sans: "Geist Variable", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Geist Mono Variable", ui-monospace, monospace;

  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-sidebar: var(--sidebar);
  --color-fg-subtle: var(--fg-subtle);
  --color-fg-faint: var(--fg-faint);
  --color-accent-soft: var(--accent-soft);
  --color-success: var(--success);
  --color-warning: var(--warning);
  --color-code-bg: var(--code-bg);

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

@layer base {
  * { @apply border-border outline-ring/50; }
  html { color-scheme: dark; }
  body { @apply bg-background text-foreground font-sans antialiased; }
  ::selection { background: rgba(59, 110, 246, 0.3); }

  /* Visible, thin scrollbars — replaces the current scrollbar hiding */
  * { scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.14) transparent; }
  *::-webkit-scrollbar { width: 8px; height: 8px; }
  *::-webkit-scrollbar-thumb { background: rgba(255,255,255,.14); border-radius: 999px; }
}
```

### 3.5 Usage rules
1. Components use semantic classes (`bg-card`, `text-muted-foreground`, `border-border`). No hex.
2. Accent appears on at most 3 elements per screen.
3. No gradients. Exception: none.
4. Borders over shadows for anything inline.
5. One accent-tinted surface (`accent-soft`) per view, reserved for the active state.

---

## 4. Responsive system

No fixed-width content. Only the two rails have min/max constraints.

| Breakpoint | Width | Sidebar | Artifact | Chat |
|---|---|---|---|---|
| `base` | < 640 | Drawer (280px) | Full-screen sheet | Full width, 16px gutters |
| `sm` | ≥ 640 | Drawer | Sheet 90vw | Full width, 24px gutters |
| `lg` | ≥ 1024 | Inline rail, 240–280px | Overlay sheet, 480px | Fluid, centered 720px |
| `xl` | ≥ 1280 | Inline, resizable | Inline, resizable | Fluid, centered 720px |
| `2xl` | ≥ 1536 | Inline, resizable | Inline up to 560px | Stays 720px centered |

Fluid rules:
- Message list and composer: `mx-auto w-full max-w-[45rem] px-4 sm:px-6`.
- Sidebar default `260px`, `min-w-[200px] max-w-[320px]`, collapse to `56px` rail.
- Artifact default `420px`, `min-w-[320px]`, max `60%` of viewport, collapse to `48px` rail.
- Composer respects `env(safe-area-inset-bottom)`; top bar respects `env(safe-area-inset-top)`.
- No horizontal scroll at any width; long code scrolls inside its own container.
- `min-h-0` on every flex child that scrolls (classic flexbox overflow trap).

---

## 5. Layout blueprints

### 5.1 Desktop (≥1280px)

```
┌────────────────────┬──────────────────────────────────────────┬─────────────────────┐
│  SIDEBAR  260px    │  CHAT HEADER                    56px     │  ARTIFACT  420px    │
│  resizable         │  ┌──────────────────────────────────────┐│  resizable          │
│ ┌────────────────┐ │  │ Chat title · 12 msgs   [Auto ⌄][◐][▥]││ ┌─────────────────┐ │
│ │ ◆ CogniMesh Free│ │  └──────────────────────────────────────┘│ │ ⬡ index.html  [⧉][▥]│ │
│ ├────────────────┤ │                                          │ ├─────────────────┤ │
│ │ ⌕ Search chats ⌘K│ │        ┌────────────────────┐            │ │ index.html │style│ │
│ │ [+] New chat    │ │        │  Assistant message │            │ ├─────────────────┤ │
│ ├────────────────┤ │        │  with markdown and │            │ │  Code  │ Preview│ │
│ │ TODAY           │ │        │  a code block      │            │ ├─────────────────┤ │
│ │ ▎ Fix login bug │ │        └────────────────────┘            │ │                 │ │
│ │   Redis notes   │ │                  ┌──────────────┐        │ │  1  <!DOCTYPE  │ │
│ │ YESTERDAY       │ │                  │ User message │        │ │  2  <html>     │ │
│ │   Netflix clone │ │                  └──────────────┘        │ │  3    <head>   │ │
│ │   PPT on Q3     │ │                                          │ │  4      ...    │ │
│ │                 │ │        ┌────────────────────┐            │ │                 │ │
│ │                 │ │        │  Thinking • • •    │            │ │                 │ │
│ ├────────────────┤ │        └────────────────────┘            │ │                 │ │
│ │ (S) Sandeep     │ │  ┌──────────────────────────────────────┐│ │                 │ │
│ │  Free · 340 cr  │ │  │ 📎  Ask anything…              🎤  ➤ ││ │                 │ │
│ └────────────────┘ │  └──────────────────────────────────────┘│ └─────────────────┘ │
└────────────────────┴──────────────────────────────────────────┴─────────────────────┘
```

### 5.2 Empty state

```
┌────────────────────┬──────────────────────────────────────────┬─────────────────────┐
│  SIDEBAR           │  CHAT HEADER: "New chat"      [Auto ⌄][◐][▥]│  ARTIFACT (hidden) │
│                    │                                          │                     │
│  ...same...        │              ◆ (logo mark)               │                     │
│                    │        Good evening, Sandeep             │                     │
│                    │   Code, docs, decks, or a quick question │                     │
│                    │                                          │                     │
│                    │   ┌──────────────┐ ┌──────────────┐      │                     │
│                    │   │ </> Write    │ │ ▤ Analyze    │      │                     │
│                    │   │     code     │ │   a PDF      │      │                     │
│                    │   └──────────────┘ └──────────────┘      │                     │
│                    │   ┌──────────────┐ ┌──────────────┐      │                     │
│                    │   │ ◫ Build a    │ │ ⊕ Search     │      │                     │
│                    │   │     deck     │ │   the web    │      │                     │
│                    │   └──────────────┘ └──────────────┘      │                     │
│                    │  ┌──────────────────────────────────────┐│                     │
│                    │  │ 📎  Ask anything…              🎤  ➤ ││                     │
│                    │  └──────────────────────────────────────┘│                     │
└────────────────────┴──────────────────────────────────────────┴─────────────────────┘
```

### 5.3 Collapsed rails

```
┌────┬──────────────────────────────┬────┐
│ ◆  │  CHAT HEADER      [Auto ⌄][◐]│ ▥  │
│ ⌕  │                              │    │
│ +  │      messages…               │ A  │
│ ▎  │                              │ r  │
│ ●  │                              │ t  │
│ ●  │                              │    │
│ (S)│  ┌────────────────────────┐  │    │
│    │  │ Ask anything…     🎤 ➤ │  │    │
│    │  └────────────────────────┘  │    │
└────┴──────────────────────────────┴────┘
 56px                                48px
```

Collapsed state persists in `localStorage` (`cm.sidebar`, `cm.artifact`).

### 5.4 Mobile (<1024px)

```
┌───────────────────────────────┐
│ ☰   Fix login bug      ▥  ◐  │  ← 52px top bar, safe-area top
├───────────────────────────────┤
│                               │
│   Assistant message           │
│   with markdown               │
│                               │
│              ┌──────────────┐ │
│              │ User message │ │
│              └──────────────┘ │
│                               │
├───────────────────────────────┤
│ ┌───────────────────────────┐ │
│ │ 📎 Ask anything…  🎤  ➤  │ │  ← sticky, safe-area bottom
│ └───────────────────────────┘ │
│ Enter to send · Shift+Enter ↵ │
└───────────────────────────────┘
```

---

## 6. Component inventory

### 6.1 File tree

```
frontend/src/
├── lib/
│   └── utils.js                  cn() = clsx + tailwind-merge
├── hooks/
│   ├── use-auto-resize.js        textarea grow 2–8 rows
│   ├── use-media-query.js
│   └── use-persisted-panel.js    localStorage panel sizes
├── components/
│   ├── ui/                       shadcn primitives (owned code)
│   │   ├── button.jsx  input.jsx  textarea.jsx  badge.jsx
│   │   ├── avatar.jsx  tooltip.jsx  dialog.jsx  sheet.jsx
│   │   ├── dropdown-menu.jsx  tabs.jsx  scroll-area.jsx
│   │   ├── separator.jsx  skeleton.jsx  progress.jsx
│   │   ├── sonner.jsx  command.jsx  resizable.jsx  kbd.jsx
│   │   └── segmented.jsx         Code | Preview control
│   ├── layout/
│   │   ├── AppShell.jsx          PanelGroup + overlays
│   │   ├── Sidebar.jsx           one tree, collapsed prop
│   │   ├── SidebarSearch.jsx
│   │   ├── ConversationItem.jsx
│   │   ├── UserCard.jsx
│   │   └── MobileTopBar.jsx
│   ├── chat/
│   │   ├── ChatPane.jsx
│   │   ├── ChatHeader.jsx
│   │   ├── AgentPicker.jsx
│   │   ├── MessageList.jsx
│   │   ├── Message.jsx
│   │   ├── MessageActions.jsx
│   │   ├── Markdown.jsx          streamdown wrapper
│   │   ├── CodeBlock.jsx         Shiki + copy
│   │   ├── Composer.jsx
│   │   ├── AttachmentChip.jsx
│   │   ├── ThinkingIndicator.jsx
│   │   ├── EmptyState.jsx
│   │   └── ScrollToBottom.jsx
│   ├── artifact/
│   │   ├── ArtifactPanel.jsx
│   │   ├── ArtifactRail.jsx
│   │   ├── FileTabs.jsx
│   │   ├── CodeView.jsx          lazy CodeMirror
│   │   └── PreviewFrame.jsx
│   ├── billing/
│   │   ├── BillingSheet.jsx
│   │   ├── PlanCard.jsx
│   │   └── CreditsMeter.jsx
│   ├── auth/
│   │   └── LoginDialog.jsx
│   └── command/
│       └── CommandPalette.jsx
├── pages/
│   └── Home.jsx                  ~20 lines: shell + login + palette
├── features/                     UNCHANGED
├── redux/                        UNCHANGED
├── utils/                        UNCHANGED
├── App.jsx                       ThemeProvider removed (dark only)
└── index.css                     tokens + base layer
```

### 6.2 Component responsibilities

| Component | Responsibility | Renders in |
|---|---|---|
| `AppShell` | 3-panel layout, panel persistence, overlay host | Root |
| `Sidebar` | Brand, search, new chat, groups, user card; `collapsed` prop | Left panel |
| `SidebarSearch` | Button that opens CommandPalette; shows `⌘K` | Sidebar |
| `ConversationItem` | Title, active bar, hover `⋯` (rename/delete) | Sidebar list |
| `UserCard` | Avatar, name, plan + credits, menu (billing/settings/logout) | Sidebar footer |
| `MobileTopBar` | Hamburger, title, artifact + agent buttons | < lg |
| `ChatHeader` | Title, message count, AgentPicker, artifact toggle, overflow | Chat pane |
| `AgentPicker` | 7 agents in 2 groups, credit cost, active check | Header (desktop), Composer (mobile) |
| `MessageList` | Scroll container, empty/loading/error states, auto-scroll | Chat pane |
| `Message` | Avatar, role layout, markdown/images, action row on hover | MessageList |
| `MessageActions` | Copy, regenerate, thumbs | Under message |
| `Markdown` | streamdown + custom renderers for code/table/link | Message |
| `CodeBlock` | Shiki highlight, language label, copy button | Markdown |
| `Composer` | Auto-grow textarea, attachments, mic, send/stop, hints | Chat pane bottom |
| `AttachmentChip` | File icon/thumb, name, size, remove, resolved agent | Composer |
| `ThinkingIndicator` | 3-dot pulse + rotating label | MessageList |
| `EmptyState` | Greeting + 4 capability cards | MessageList |
| `ScrollToBottom` | Appears when scrolled up | Chat pane |
| `ArtifactPanel` | Header, tabs, code/preview toggle, body | Right panel |
| `ArtifactRail` | Collapsed 48px vertical label + expand | Right panel |
| `FileTabs` | File names, active underline, horizontal scroll | Artifact |
| `CodeView` | Lazy CodeMirror, read-only, themed | Artifact |
| `PreviewFrame` | Sandboxed iframe with composed HTML/CSS/JS | Artifact |
| `BillingSheet` | Credits meter, 3 plans, Razorpay | Overlay |
| `PlanCard` | Tier name, price, credits, features, CTA | BillingSheet |
| `CreditsMeter` | Progress bar + `340 / 500` | Billing, Sidebar |
| `LoginDialog` | Branded Google sign-in | Overlay |
| `CommandPalette` | ⌘K actions + conversation jump | Overlay |
| `Toaster` | sonner mount | Root |

---

## 7. Agent picker

### 7.1 Backend truth

Source: `backend/services/agent/controllers/agent.controller.js:9`, `backend/services/auth/controllers/auth.controller.js:12`, `backend/services/agent/config/agentLimit.js`.

| id | Label | Icon | Behavior | Credits | Limit/min |
|---|---|---|---|---|---|
| `auto` | Auto | Zap | LLM router picks agent | 1–10 | — |
| `chat` | Chat | MessageSquare | General Q&A | 1 | 20 |
| `search` | Search | Globe | Live web (Tavily) | 5 | 5 |
| `coding` | Coding | Code2 | Build/debug/architect | 10 | 5 |
| `pdf` | Create PDF | FileText | Generates a PDF | 10 | 5 |
| `ppt` | Create slides | Presentation | Generates a `.pptx` | 10 | 5 |
| `vision` | Create image | ImageIcon | Generates an image | 10 | 5 |

Auto-only (never manually selectable — `agent.controller.js:73` rejects them without a file):

| id | Surface label | Trigger | Credits |
|---|---|---|---|
| `pdfRag` | PDF Chat | Attach a PDF | 10 |
| `imageAnalyzer` | Analyze image | Attach an image | 10 |

### 7.2 Naming fix
`pdf` generates a PDF, it does not read one. `vision` generates an image. Labels in 7.1 are authoritative; do not reuse the backend ids as UI labels.

### 7.3 Placement
- Desktop: chat header right cluster.
- Mobile: composer toolbar, left of send.
- Empty state: 4 capability cards act as shortcuts (no chip row).
- **Removed:** the 7 wrapped chips above the textarea.

### 7.4 Dropdown spec

```
┌──────────────────────────────────────────────┐
│  ⚡  Auto                              ✓     │
│     Picks the best agent automatically   1–10│
├──────────────────────────────────────────────┤
│  EVERYDAY                                    │
│  💬 Chat                                  1 cr│
│     General questions and explanations        │
│  🌐 Search                                5 cr│
│     Live results from the web                 │
│  </> Coding                              10 cr│
│     Build, debug, and architect code          │
├──────────────────────────────────────────────┤
│  CREATE                                      │
│  📄 Create PDF                           10 cr│
│     Generate a document you can download      │
│  📊 Create slides                        10 cr│
│     Generate a .pptx deck                     │
│  🖼 Create image                         10 cr│
│     Generate an image from a prompt           │
├──────────────────────────────────────────────┤
│  📎 Attach a PDF or image to chat with it     │
└──────────────────────────────────────────────┘
```

Row: 44px, 16px icon in a `bg-muted` tile, 13px name, 11.5px muted description, mono credit cost right-aligned, active row `bg-accent-soft` + check. Section labels 10px uppercase `text-fg-faint`.

### 7.5 Behavior rules
1. Default `auto`; resets to `auto` on new conversation. Agent is per-message, not per-conversation.
2. **Attaching a file forces `auto`** and shows the resolved chip (`PDF Chat · 10 cr`). Prevents `router.js:5` from silently ignoring the file.
3. Create agents change the placeholder (`Describe the document you want…`).
4. Rows disabled when `credits < cost`, showing `Needs 10 credits` in `text-warning`.
5. On `429`, toast uses the backend's `retryAfter` (`agentLimit.js:28`).
6. On `400`, toast + revert to `auto`.

---

## 8. Screen specs

### 8.1 Sidebar (5 zones)

| Zone | Height | Contents |
|---|---|---|
| Brand | 56px | 24px logo mark, "CogniMesh", plan badge, collapse button |
| Search | 44px | Fake input → CommandPalette, `⌘K` hint |
| New chat | 40px | Full width, `bg-accent-soft`, `+`, hover `bg-accent/20` |
| Conversations | flex, scroll | Date groups Today / Yesterday / Previous 7 days / Older; 34px rows; active = 2px cobalt left bar + `bg-accent-soft`; hover reveals `⋯` |
| User card | 64px | 28px avatar, name, `Free · 340 credits`, `⋯` menu |

Empty: `No chats yet` + `Start your first chat` link. No `MessageSquare` icons on rows.

### 8.2 Chat header (56px)
Left: title (14px semibold, truncates), message count badge (only if > 0).
Right: `AgentPicker`, artifact toggle, `⋯` (rename / export / delete). `⋯` is wired in `ChatHeader`.

### 8.3 Messages
- Container `max-w-[45rem] mx-auto`, `space-y-6`, `py-6`.
- Assistant: 24px avatar + transparent body, full column width.
- User: right-aligned, `bg-popover border border-border`, `max-w-[85%]`, radius 14 with `rounded-br-sm`.
- Hover action row: copy, regenerate, thumbs up/down. Timestamp appears on hover.
- Markdown: `streamdown`; custom code block, table (border `--border`), blockquote (left border 2px accent), links (`text-primary` + `ExternalLink`), inline code (`bg-muted` + mono).
- Images: 160×112 thumbs, click → lightbox.
- Agent tag under assistant messages (requires §13.1): `⚡ Auto → </> Coding · 10 cr`.

### 8.4 Composer
- Sticky bottom, `max-w-[45rem]`, 16px gutter, fade above.
- Card: `bg-popover border border-border rounded-xl`, focus → `border-primary/40` + ring.
- Row 1: attachment chips (conditional).
- Row 2: auto-grow textarea 2–8 rows, `Enter` sends, `Shift+Enter` newline.
- Row 3: attach, mic (left) · send/stop (right). Mobile also gets AgentPicker here.
- Hint: `Enter to send · Shift+Enter for newline` and `CogniMesh can make mistakes.`
- Send disabled when empty or loading; becomes a square Stop button while loading.
- Drag-and-drop + paste image supported.

### 8.5 Empty state
Logo mark, `Good evening, {firstName}`, subtitle, 2×2 cards (`max-w-[40rem]`), each 72px tall with icon, title, one-line description. Card click sets agent and prefills composer. `Analyze a PDF` opens the file picker.

### 8.6 Artifact panel
Header 56px (file icon, title, copy, open external, close) · File tabs 36px · View toggle 40px (only if `index.html` exists) · Body.
CodeMirror: read-only, `lineNumbers`, no minimap, `wordWrap: on`, theme `one-dark`-equivalent custom, font Geist Mono 12.5, padding 16.
Preview: iframe `sandbox="allow-scripts"`, composed from `index.html` + `style.css` + `script.js`.
Empty: panel unmounts, toggle hidden — no layout jump because `Panel` handles sizing.
Mobile: `Sheet` from right, 92vw.

### 8.7 Billing sheet (420px)
Credits meter with percentage · current plan card with crown · 3 `PlanCard`s from `PLANS` (Free ₹0/100, Starter ₹199/500, Pro ₹499/1000) · feature bullets · `Most popular` on Pro · Razorpay flow unchanged (`createOrder` → `window.Razorpay` → `verifyPayment`).

### 8.8 Login dialog
Centered card, 380px, logo mark, headline, one-line value prop, Google button (white, `FcGoogle`), terms line. Backdrop `bg-black/70 backdrop-blur-sm`. No close button while unauthenticated.

### 8.9 Command palette (⌘K)
Groups: Actions (New chat, Toggle sidebar, Toggle artifact, Billing, Logout), Conversations (filter by title). Mono kbd hints. `Esc` closes.

### 8.10 Toasts
`sonner`, bottom-right desktop / top-center mobile, `richColors`, 3s default. Used for copy, upgrade success/failure, rate limit, file errors.

---

## 9. State matrix

| State | UI |
|---|---|
| Boot | Shell skeleton: sidebar rows, centered logo pulse |
| Unauthenticated | Login dialog over blurred shell |
| No conversations | Sidebar empty message + chat empty state |
| Conversation loading | 3 message skeletons |
| Sending | User bubble instantly; thinking indicator; send → stop |
| Streaming (future) | Cursor block; streamdown renders partial markdown |
| Agent error | Inline error card + Retry + toast (needs §13.3) |
| Rate limited | Toast with `retryAfter`, composer re-enabled |
| Out of credits | Composer disabled, banner `Upgrade to continue` |
| No artifacts | Artifact panel unmounted, toggle hidden |
| Empty artifact files | Panel shows `No files` state |

---

## 10. Dependencies

### Install
```bash
cd frontend
npm i clsx tailwind-merge class-variance-authority sonner cmdk \
  streamdown @streamdown/code \
  @uiw/react-codemirror @codemirror/lang-javascript @codemirror/lang-html \
  @codemirror/lang-css @codemirror/lang-json @codemirror/lang-python \
  react-resizable-panels \
  @fontsource-variable/geist @fontsource-variable/geist-mono
```

### Remove
```bash
npm rm react-markdown react-syntax-highlighter remark-gfm @monaco-editor/react
```

### shadcn
```bash
npx shadcn@latest init          # base color: neutral, CSS variables: yes
npx shadcn@latest add button input textarea badge avatar tooltip dialog sheet \
  dropdown-menu tabs scroll-area separator skeleton progress sonner command \
  resizable kbd
```

### Notes
- `next-themes` is **not** installed (dark only).
- `vite.config.js` needs an `@` alias → `src`, plus `jsconfig.json` paths, for shadcn imports.
- `streamdown` is declared with `@source` in `index.css` so Tailwind sees its classes.
- `@streamdown/code` pulls Shiki; both code paths are lazy-loaded.
- Net bundle impact is negative: `react-syntax-highlighter` (2.1MB unpacked) and Monaco's 2–3MB runtime go away.

---

## 11. Phase plan

### P0 — Foundation (no visual change) — ✅ complete
1. Install/remove dependencies.
2. `vite.config.js` alias + `jsconfig.json`.
3. `npx shadcn init` + primitives.
4. `lib/utils.js` (`cn`).
5. `index.css` tokens, fonts, base layer, scrollbars.
6. Replace every `#0d0f14` with `bg-card` / `bg-background`.

**Acceptance:** app renders identically, `grep -r "#0d0f14" src` returns nothing, build + lint pass. — **passed**, Docker stack verified.

### P1 — Shell — ✅ complete
1. `AppShell` with `PanelGroup`, persistence.
2. `Sidebar` single tree + collapse + mobile drawer.
3. `ConversationItem` with rename/delete + date groups. `DELETE /api/chat/delete-conversation/:id` is implemented.
4. `UserCard` + credits.
5. `ChatHeader` + `MobileTopBar`.

**Acceptance:** sidebar collapses at 1024px, drawer works at 375px, resize persists after reload, no duplicated markup. — **passed** in Docker at 1440px and 375px: 260px default, 56px collapsed (persists after reload), 320px after resize (persists), drawer closes on select and `Esc`. Rename, command-palette search, new chat, `⌘K`, rail expand, mobile billing, and conversation delete were verified. P1 regression is 16/16.

**P1 notes**
- Delete is wired: `DELETE /api/chat/delete-conversation/:id` removes the conversation and its messages; the row menu and chat header confirm before deleting.
- Search is a `SidebarSearch` trigger for `CommandPalette`; sidebar local filtering is removed.
- `BillingSheet` is rendered once in `AppShell`; `BillingDrawer` is removed.
- Sidebar conversation loading keys off `userData.userId` (the `/api/me` session shape, not `_id`), so it loads after login.
- `ChatArea` only reloads messages when the conversation **id** changes, avoiding a refetch that used to wipe the optimistic first message when the title was set.
- `SideBar.jsx`, `Nav.jsx`, `LoadingAnimation.jsx`, and `BillingDrawer.jsx` are removed; `Sidebar` uses one tree; `ChatHeader` owns the header.

### P2 — Chat — ✅ complete
1. `Composer` (auto-grow, Enter/Shift+Enter, drag-drop, paste, chips).
2. `Markdown` via streamdown + built-in Shiki code block.
3. `Message` + `MessageActions` + lightbox.
4. `EmptyState` wired to agents.
5. `ThinkingIndicator`, `ScrollToBottom`, skeletons.
6. `AgentPicker` (7 agents, credits, file routing).

**Acceptance:** send a chat end-to-end, code blocks copy, empty cards work, attach PDF shows `PDF Chat` chip, no console errors. — **frontend passed** in Docker at 1440px and 375px: 69/69 headless checks covering the empty state, all seven agents, starter cards, send/stop/thinking, code and message copy, scroll-to-bottom, lightbox open/close, PDF/image chips, live `Auto → Coding` and `Auto → PDF Chat` tags, persisted agent tags after reload, mobile menu/layout, and zero console errors. The P1 shell regression harness passes 16/16 against the same build. The live `/api/agent/chat` call was mocked because MongoDB Atlas rejected the current host IP; `agent` persistence passed separately against a temporary local MongoDB using the real `chat.controller.js` and `message.model.js` (`coding` was saved, returned by `getMessages`, and re-read from the document).

**P2 notes**
- `ChatArea` owns `useSendMessage`; `ChatSession` is keyed by conversation id so draft/attachment reset and the abort controller survives the first-message remount.
- Live tags use `requestedAgent` (`⚡ Auto → Coding`); history shows only the persisted resolved `agent`.
- Attaching a PDF/image forces `auto`, shows the resolved file-agent cost, and disables the picker. Choosing a starter card clears any pending attachment.
- Streamdown's built-in code block provides Shiki highlighting and copy; download is disabled. There is no separate `CodeBlock.jsx`.
- Mobile composer swaps the keyboard hint for the disclaimer; 375px has no horizontal overflow.
- Bundle after P2: ~1.55 MB / 481.7 kB gzip. P3 removes Monaco.

### P3 — Artifact — ✅ complete
1. `ArtifactPanel` + rail; the panel stays mounted while collapsed.
2. `FileTabs`, view toggle.
3. Lazy `CodeView` (CodeMirror) + `PreviewFrame`.
4. Mobile sheet.

**Acceptance:** artifact survives conversation switch, preview renders generated HTML, Monaco absent from bundle (`grep -r "monaco" dist`). — **frontend passed** in Docker at 1440px and 375px: 54/54 headless checks covering the 420px default panel, file tabs, CodeMirror content and theme, file copy, CSS tab switching, preview HTML/CSS/JS execution, `sandbox="allow-scripts"`, the 48px rail, header toggle, conversation switching, no-artifact hiding, live artifact open, artifact preservation on a no-artifact follow-up, artifact restoration after reload, collapsed-state restoration, the 345px mobile sheet, no horizontal overflow, no gradients, and zero console errors. The P1 shell regression harness passes 16/16 and the P2 chat harness 69/69 against the same build. `grep -ri monaco dist` and the Docker image both return nothing.

**P3 notes**
- The artifact panel is conditionally mounted only while the conversation has artifacts (per the §8.6 state matrix); collapsing keeps it mounted as a 48px rail.
- CodeMirror uses a custom `--code-bg` theme plus the oneDark highlight style. Line wrapping is on per §8.6. The editor chunk is lazy-loaded and is 622 kB / 218 kB gzip; the main bundle is ~1.54 MB / 478 kB gzip.
- `PreviewFrame` composes `index.html`, `style.css`, and `script.js` into a full document and runs it in a script-only sandbox. The preview remains available in the artifact toolbar as a blob URL.
- `cm.artifact` persists the collapsed state across reloads. The mobile sheet suppresses auto-focus so the first header tooltip does not open when the sheet appears.
- `Home.jsx` no longer renders the legacy `Artifact`; `Artifact.jsx` and `@monaco-editor/react` are deleted.

### P4 — Overlays — ✅ complete
1. `BillingSheet` + `PlanCard` + `CreditsMeter`.
2. `LoginDialog`.
3. `CommandPalette`.
4. `Toaster` + error/rate-limit handling.

**Acceptance:** Razorpay sheet opens, ⌘K navigates, every previously-dead button works. — **frontend passed** in Docker at 1440px and 375px: `npm run lint`, `npm run build`, Docker rebuild, and `grep -ri monaco dist` clean. P1 shell regression 16/16, P2 chat regression 69/69, P3 artifact regression 54/54, and P4 overlays 62/62 headless checks passed against the same rebuilt Docker image. `C:\Users\SANDEEP K G\AppData\Local\Temp\opencode\cm-shots\p4-functional.js` screenshots `p4-01-main.png`, `p4-02-login.png`, `p4-03-rate-limit.png`, `p4-04-mobile.png`. P1 harness updated for command-palette behavior in `C:\Users\SANDEEP K G\AppData\Local\Temp\opencode\cm-shots\functional.js`.

**P4 notes**
- `lib/plans.js` owns `PLANS`, `getPlan`, `getCreditTotal`, `getCreditPercent`; `totalCredits` is used when present/positive, otherwise derived from the current plan, not `totalCredits || 100`.
- `BillingSheet` is a 420px right sheet; current plan card with crown, `CreditsMeter`, 3 `PlanCard`s, `Most popular` on Pro, `SheetClose` X, body scroll, mobile `max-w-[calc(100vw-1rem)]`, and initial focus on the title. It uses `Sheet` state; `SheetContent` is not a trigger.
- `BillingSheet` calls `createOrder` → `window.Razorpay` → `verifyPayment`; `createOrder`/`verifyPayment` `[]` returns are treated as failure; `order?.id` is checked; `key` is `VITE_RAZORPAY_KEY_ID`; `theme.color` `#3B6EF6`; `payment.failed` shows a toast; after success `getCurrentUser` refreshes `setUserdata`. `razorpay.open` is called once; buttons re-enable in `finally`. The old `BillingDrawer` is replaced and unused.
- `LoginDialog` is a 380px Radix dialog; `bg-black/70 backdrop-blur-sm`; `showCloseButton=false`; no `DialogClose`; `onEscapeKeyDown`/`onPointerDownOutside` prevent closing while `!userData`; white `FcGoogle` button; no close while unauthenticated; `signInWithPopup` + `/api/auth/login` dispatch `setUserdata`; sign-in failure shows a toast; no-op `onOpenChange`.
- `CommandPalette` lives in `AppShell`, wrapped in `ArtifactPanelContext`, `enabled={Boolean(userData)}`. Ctrl/⌘K toggles; `CommandDialog` `Command` wrapper is present; `DialogTitle`/`DialogDescription` render inside `DialogContent`; `overlayClassName` is supported; `CommandItem` uses `bg-hover`. Groups `Actions` (`New chat`, `Toggle sidebar`, `Toggle artifact`, `Billing`, `Log out`) and `Conversations`. `SidebarSearch` is a button; `Sidebar` local filtering removed; `Sidebar` `onOpenCommandPalette` opens palette from expanded search, collapsed rail, and mobile; `onOpenBilling`/`onNavigate` handled; `openBilling` closes mobile/sheets; `onToggleSidebar` uses `sidebarRef`. `useLogout` shared by `UserCard` and `CommandPalette`. `BillingSheet` and `CommandPalette` are rendered once outside the desktop/mobile conditional. `commandOpen` is `AppShell` state.
- `DialogContent` accepts `overlayClassName`; `CommandDialog` accepts `overlayClassName`, places `DialogHeader` inside `DialogContent`, wraps children in `Command`, uses `CommandEmpty`, and kbd hints; selected command items use `bg-hover`.
- `sendMessage` re-throws Axios errors as `{ error }` instead of swallowing; `useSendMessage` re-enables `setIsLoading(false)` in `finally`; `notifySendError` uses backend `message`, shows `sonner` toasts; 429 `toast.warning` with retry message (duration 5000); 402 toast; generic error toast; composer draft retained; `sendMessage` still returns `null` on abort.
- `Toaster` `duration={3000}`; `offset={{ bottom: 180, right: 24 }}` so rate-limit/copy toasts do not cover the composer send button; mobile `top-center`; `theme="dark"`; `richColors`.
- `Home.jsx` renders `<AppShell>` + `<ChatArea>` + `<LoginDialog open={!userData}>`; no inline login. `BillingDrawer` no longer rendered.

### P5 — Polish — ✅ complete
1. Keyboard pass + `focus-visible` audit.
2. 375 / 768 / 1024 / 1440 / 2560 checks.
3. Reduced motion.
4. Bundle + Lighthouse check.
5. Delete dead components (`Nav.jsx`, `LoadingAnimation.jsx` after replacement, `BillingDrawer.jsx`).

**Acceptance:** keyboard-only walkthrough passes, no horizontal scroll, Lighthouse a11y ≥ 95. — **frontend passed** in Docker after P4: `npm run lint`, `npm run build`, Docker rebuild, `grep -ri monaco dist` clean, no gradients, `@media (prefers-reduced-motion: reduce)` present, `focus-visible` rings on controls. P1 16/16, P2 69/69, P3 54/54, P4 62/62, P5 20/20, remaining-feature P5 18/18. Breakpoints 375/768/1024/1440/2560 no horizontal scroll. `C:\Users\SANDEEP K G\AppData\Local\Temp\opencode\cm-shots\p5-functional.js` screenshots `p5-*.png`. Lighthouse accessibility score **1.0** on production Docker; `color-contrast` passes. Main bundle ~1.45 MB / 447 kB gzip; lazy `CodeView` ~622 kB / 218 kB gzip. `BillingDrawer.jsx` deleted; `Nav.jsx`/`LoadingAnimation.jsx` not present. `dist` has no Monaco. Local feature commits are present; nothing has been pushed.

---

## 12. Bugs folded in

| File | Line | Issue | Fix |
|---|---|---|---|
| `SideBar.jsx` | 66, 184 | Stray literal quote in `className='"relative shrink-0'` | Rewrite |
| `SideBar.jsx` | 45-62 | Collapsed rows render icon only, no title/tooltip | Tooltip + initial |
| `MessageBubble.jsx` | 33 | `images.length` unguarded | Default `[]` at prop |
| `ChatInput.jsx` | 52-60 | `alert()` then still calls `.start()` on null ref | `if (!ref.current) return toast` |
| `ChatInput.jsx` | 229 | Fixed `rows={3}`, no Enter-to-send | Auto-grow + keydown |
| `ChatInput.jsx` | 208 | Object URL never revoked, no `alt` | `useEffect` cleanup + alt |
| `Artifact.jsx` | 163 | `return;` returns `undefined` | Return `null`, panel handles empty |
| `Artifact.jsx` | 244 | Hardcoded width 400 | Resizable panel |
| `MessageList.jsx` | 32 | Suggested prompts have no `onClick` | Wire to composer |
| `SideBar.jsx` | 222 | Login button does nothing | Open `LoginDialog` |
| `BillingDrawer.jsx` | 89 | `totalCredits \|\| 100` mismatches plans | Derive from plan |
| `Nav.jsx` | — | Duplicate header logic | Replaced by `ChatHeader` |

---

## 13. Backend changes

### 13.1 Approved — return **and persist** the resolved agent

**Why:** the agent tag must survive a page refresh. Live responses carry the value; history reads it from MongoDB. No session-only fallback.

`result.agent` is set by the router (`graph/router.js:8`, `:16`, `:23`, `:94`) and spread through every agent, so it is always the **resolved** id — `auto` becomes `coding`, `pdfRag`, etc.

Four files, in order:

**1. `backend/services/agent/controllers/agent.controller.js:138` — return it**

```diff
 return res.status(200).json({
+    agent: result?.agent,
     answer,
     images,
     artifacts
 })
```

**2. `backend/services/agent/controllers/agent.controller.js:130` — send it to the chat service**

```diff
 await saveMessage(userId, {
     conversationId,
     role: "assistant",
     content: answer,
+    agent: result?.agent,
     images,
     artifacts
 })
```

**3. `backend/services/chat/models/message.model.js:21` — add the field**

```diff
     role:{ type:String, enum:["user","assistant"] },
     content:String,
+    agent:{
+        type:String,
+        enum:["auto","chat","search","coding","pdf","ppt","vision","pdfRag","imageAnalyzer"]
+    },
     images:[String],
     artifacts:[artifactSchema]
```

String + enum rejects bad values without blocking `null` on user messages.

**4. `backend/services/chat/controllers/chat.controller.js:74` and `:95` — accept and store it**

```diff
-const { conversationId, role, content, images, artifacts } = req.body || {}
+const { conversationId, role, content, images, artifacts, agent } = req.body || {}
```

```diff
 const message = await Message.create({
     conversationId,
     content,
     role,
+    agent,
     images,
     artifacts
 })
```

`getMessages` (`chat.controller.js:127`) returns full documents with no projection, so `agent` appears in history automatically — **no change needed there.**

**Frontend contract**
- Live: `data.agent` from `sendMessage()` → store it on the assistant message in Redux (`messageSlice`).
- History: `msg.agent` from `getMessages()` → already in the payload after step 3.
- Render only when present; user messages and legacy rows have no tag.
- Label map uses §7.1: `⚡ Auto → </> Coding · 10 cr` when the user picked Auto, `</> Coding · 10 cr` when picked explicitly.
- Tag sits under the assistant message body, 11px, `text-fg-subtle`, with the agent icon at 12px.

**Backfill:** existing messages have no `agent`, so the tag simply doesn't render. No migration, no default value, no crash.

### 13.2 Corrections — do NOT change these
Documented so nobody "fixes" working code:

| Suspected bug | Reality |
|---|---|
| `agentLimit.js` `image` key vs `vision` agent | Correct. Callers pass `"image"` (`vision.agent.js:10`, `imageAnalyzer.agent.js:8`), map has `image: 5`. |
| `COST` missing `auto` | Correct. `auto` never reaches `deductCredits`; each agent passes its own id. |
| Double charge in `coding.agent.js` (lines 95 + 140) | Correct. Mutually exclusive branches; line 97 returns before line 140. |

### 13.3 Implemented error propagation, credit pre-check, and clearer `imageAnalyzer` labeling
- **Error propagation:** agents return `failed: true`; the controller maps `failed`, `agent`, `answer`, `images`, and `artifacts`; failed assistant messages are not persisted; `useSendMessage` surfaces a toast and does not add an assistant message.
- **Credit pre-check:** `checkCredits` runs before LLM invocation; auth `/internal/credits` validates `credits >= requiredCredits`; `deductCredits` no longer swallows failures.
- **`imageAnalyzer` charge label:** `imageAnalyzer` now uses `"imageAnalyzer"` for credit check and `deductCredits`, distinct from `vision`.

---

## 14. Accessibility checklist

- Every icon-only button has `aria-label`.
- All interactive elements are `<button>` / `<a>`, never clickable `<div>`.
- Visible `focus-visible` ring on every control.
- Dialogs/sheets: focus trap, `Esc`, restore focus on close (Radix handles).
- `aria-live="polite"` on the message list for new assistant messages.
- `aria-busy` on the composer while sending.
- Images have `alt`; decorative icons `aria-hidden`.
- Contrast: body text `#EDEDEF` on `#0A0A0B` ≈ 16:1; muted `#A1A1A6` ≈ 8:1; never use `fg-faint` for text below 11px.
- Keyboard map: `⌘K` palette, `⌘B` sidebar, `⌘J` artifact, `Enter` send, `Shift+Enter` newline, `Esc` close layer. `Cmd/Ctrl+B` and `Cmd/Ctrl+J` are wired in `AppShell`.
- `prefers-reduced-motion` disables pulses and panel transitions.

---

## 15. Verification

Two gates per phase: a fast static gate, then the real app running in Docker.

### 15.1 Static gate (every phase)

```bash
cd frontend
npm run build
npm run lint
```

`npm run dev` is fine for quick iteration while coding, but it is **not** the acceptance gate. It skips nginx, the `/api/` proxy, same-origin cookies, and the production build.

### 15.2 Local Docker stack (the real gate)

There is no full-stack compose file today — `backend/docker-compose.yml` only runs Redis. Add **one new file at the repo root**: `docker-compose.local.yml`.

```yaml
name: cognimesh-local

services:
  redis:
    image: redis:7-alpine
    command: ["redis-server", "--requirepass", "${REDIS_PASSWORD}", "--appendonly", "yes"]
    volumes: [redis-data:/data]
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 5s
      timeout: 3s
      retries: 10

  gateway:
    build: { context: ./backend, dockerfile: gateway/Dockerfile }
    env_file: ./backend/gateway/.env
    environment:
      # Listen on 80 so nginx's `proxy_pass http://gateway;` works unchanged.
      # Production ACA ingress maps 80 -> 8000 the same way.
      PORT: 80
      AUTH_SERVICE: http://auth:8001
      CHAT_SERVICE: http://chat:8002
      AGENT_SERVICE: http://agent:8003
      BILLING_SERVICE: http://billing:8004
      FRONTEND_URL: http://localhost:8080
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
    depends_on:
      redis: { condition: service_healthy }
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:80/"]
      interval: 5s
      timeout: 3s
      retries: 20

  auth:
    build: { context: ./backend, dockerfile: services/auth/Dockerfile }
    env_file: ./backend/services/auth/.env
    environment:
      PORT: 8001
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
    depends_on:
      redis: { condition: service_healthy }

  chat:
    build: { context: ./backend, dockerfile: services/chat/Dockerfile }
    env_file: ./backend/services/chat/.env
    environment:
      PORT: 8002

  agent:
    build: { context: ./backend, dockerfile: services/agent/Dockerfile }
    env_file: ./backend/services/agent/.env
    environment:
      PORT: 8003
      AUTH_SERVICE: http://auth:8001
      CHAT_SERVICE: http://chat:8002
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
    depends_on: [redis, auth, chat]

  billing:
    build: { context: ./backend, dockerfile: services/billing/Dockerfile }
    env_file: ./backend/services/billing/.env
    environment:
      PORT: 8004
      AUTH_SERVICE: http://auth:8001
    depends_on: [auth]

  frontend:
    build:
      context: ./frontend
      args:
        VITE_FIREBASE_API_KEY: ${VITE_FIREBASE_API_KEY}
        VITE_RAZORPAY_KEY_ID: ${VITE_RAZORPAY_KEY_ID}
    ports: ["8080:80"]
    depends_on:
      gateway: { condition: service_healthy }

volumes:
  redis-data:
```

Root `.env` (gitignored) supplies the three interpolated values:

```bash
REDIS_PASSWORD=<openssl rand -hex 32>
VITE_FIREBASE_API_KEY=<from frontend/.env>
VITE_RAZORPAY_KEY_ID=<from frontend/.env>
```

Run:

```bash
docker compose -f docker-compose.local.yml up --build
# open http://localhost:8080

docker compose -f docker-compose.local.yml logs -f gateway agent
docker compose -f docker-compose.local.yml ps
docker compose -f docker-compose.local.yml down       # keep Redis data
docker compose -f docker-compose.local.yml down -v    # wipe Redis
```

**Pre-flight gotchas (must handle in P0):**

1. **`backend/services/auth/.env` is missing `FIREBASE_SERVICE_ACCOUNT`.** Locally it works via the JSON fallback file, but `backend/.dockerignore` excludes `*firebase-adminsdk*.json` and `services/auth/multiagent-*.json`, so the auth container exits on boot. Add the service-account JSON as a single-line value to `auth/.env`. Compose passes `env_file` values raw, so no `$` interpolation problems.
2. **Only port 8080 is published.** All API traffic goes browser → nginx `/api/` → `gateway` → services, exactly like production. Do not publish 8000–8004.
3. **Do not pass `VITE_SERVER_URL` into the frontend build.** Axios must use relative `/api`; the Dockerfile only declares the Firebase and Razorpay args.
4. **Do not mark the compose network `internal: true`.** Services need egress to MongoDB Atlas, Qdrant, Upstash, Firebase, Razorpay, and OmniRouter.
5. **`nginx.conf` resolves `gateway` at startup.** The gateway healthcheck plus `depends_on: service_healthy` prevents nginx from booting before the upstream exists. The local gateway must listen on **port 80** (`PORT: 80`) because `proxy_pass http://gateway;` defaults to port 80; production ACA ingress maps 80 → 8000, so `nginx.conf` stays identical in both environments.
6. **Windows/Docker Desktop:** rebuild after code changes (`up --build`); there is no bind mount or hot reload in this flow by design.

Why Docker instead of `npm run dev`: same-origin cookie behavior, the 50MB upload limit and 300s proxy timeout from `nginx.conf`, real `VITE_*` build args, and it catches missing Dockerfile dependencies. A UI that works in Vite but fails behind nginx is not done.

### 15.3 Smoke list (run in Docker, every phase)

1. Log in with Google at `http://localhost:8080`.
2. New chat → send a prompt → response renders.
3. Code block → copy button works.
4. Attach a PDF → chip shows `PDF Chat · 10 cr` → send → answer returns.
5. **Refresh the page → assistant message still shows the agent tag** (§13.1 persistence).
6. Switch conversation → messages load → artifact restores.
7. Resize panels → refresh → sizes persist.
8. ⌘K → jump to a conversation.
9. Billing → Razorpay sheet opens.
10. 375px → drawer, composer, and artifact sheet all usable.
11. Tab-only walkthrough with visible focus rings.

### 15.4 Bundle checks

```bash
grep -r "monaco" frontend/dist                  # expect nothing
grep -r "react-syntax-highlighter" frontend/dist # expect nothing
```

---

## 16. Git & delivery policy

**Hard rules**

1. No `git commit` unless the user explicitly asks. Local feature commits are allowed when requested.
2. No `git push` to GitHub, Azure, or any remote. Not once, until told.
3. No tags, releases, or workflow dispatches. `deploy.yml` is push-triggered on `main`; we stay off it.
4. No edits to `.github/workflows/*`.
5. Never stage `.env`, `*firebase-adminsdk*.json`, `dist/`, or `node_modules/`.
6. Before any future commit: run `git status`, show the file list, and get confirmation.

**If commits are requested later — split by feature, never one mega-commit**

| # | Message | Scope |
|---|---|---|
| 1 | `chore(ui): add design tokens, Geist fonts, and shadcn primitives` | P0 |
| 2 | `refactor(ui): replace fixed layout with resizable three-pane shell` | P1 |
| 3 | `feat(ui): rebuild sidebar with search, date groups, and row actions` | P1 |
| 4 | `feat(ui): rebuild composer with auto-grow, attachments, and agent picker` | P2 |
| 5 | `feat(ui): render messages with streamdown and CodeMirror code blocks` | P2 |
| 6 | `feat(ui): rebuild artifact panel on CodeMirror with resizable rail` | P3 |
| 7 | `feat(ui): rebuild billing sheet and login dialog` | P4 |
| 8 | `feat(ui): add command palette, toasts, and error states` | P4 |
| 9 | `feat(api): return and persist resolved agent on chat responses` | §13.1 |
| 10 | `chore(ui): accessibility, responsive, and dead-code cleanup` | P5 |
| 11 | `build(docker): add local full-stack compose file` | §15.2 |

Each commit must build and lint on its own. No commit may mix a refactor with a feature.

---

## 17. Risks & rollback

| Risk | Mitigation |
|---|---|
| shadcn init rewrites `index.css` | Commit before P0; restore tokens manually |
| Tailwind 4 + shadcn class mismatch | Pin shadcn to a Tailwind-4-compatible version; verify a button renders |
| streamdown renders differently than react-markdown | Keep `Markdown.jsx` as the only wrapper so swapping back is one file |
| CodeMirror theme looks off | Custom theme object lives in `CodeView.jsx` only |
| Resizable panels break mobile | Panels disabled below `lg`; drawer/sheet take over |
| Losing existing behavior during refactor | Phases are separate commits; `git revert` per phase |
| Backend `agent` field missing | UI tag is optional — render only if present |
| Auth container exits on boot in Docker | Add `FIREBASE_SERVICE_ACCOUNT` to `auth/.env` before first run (§15.2 gotcha 1) |
| Env drift between service `.env` files and compose | Compose only overrides ports + service URLs; everything else comes from the existing `env_file` |
| nginx boots before gateway is resolvable | Gateway healthcheck + `depends_on: service_healthy` |
| Local Docker can't reach Mongo/Qdrant/Upstash | Keep the compose network non-internal; these are cloud services |

Commit strategy: local commits split by feature with conventional messages; no pushes. No mixed mega-commit.

---

## 18. Out of scope

- Streaming / SSE responses.
- Light mode (tokens ready, UI not built).
- Email/password or magic-link auth.
- New backend features beyond §13.1, conversation delete, §13.3, `/internal/credits`, and accessibility cleanup.
- Marketing site / landing page.
- Unit or E2E tests beyond build + lint.
- i18n / RTL.
- Drag-to-reorder conversations.
- Message editing / branching.
- File upload progress for large PDFs (currently a single spinner).
