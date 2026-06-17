# CLAUDE.md

Guidance for Claude (and any AI agent) working in this repository. Read this first.

## Project: PDF → PNG (PWA)

A **fully client-side Progressive Web App** that converts PDF files into PNG images
(one PNG per page), hosted **free on GitHub Pages**. No backend, no accounts, no
tracking. Files never leave the user's device.

- **Owner:** Simeon "Moni" Tsvetanov · tsvetanov.simeon@gmail.com
- **Support / donations:** https://buymeacoffee.com/simeontsvetanov
- **Hosting:** GitHub Pages (static), deployed via GitHub Actions.

## Core features (the brief)

1. Convert a PDF to PNG — each page → its own PNG.
2. Download pages individually **and** all-at-once as a ZIP.
3. **Scale control 0.1–1.0** (default **1.0** = full quality). Lower = smaller/faster.
4. **No accounts**, no login.
5. **Light / Dark / System** themes.
6. **About / Help / Terms** in a modern menu (hamburger `Sheet` on mobile, dropdown on desktop).
7. Installable **standalone PWA** (Android, iOS, desktop).
8. **Install prompt** shown when the app is NOT already installed (with iOS "Add to Home Screen" fallback).
9. **Client-side "service" mode**: usable from other platforms via URL params + iframe `postMessage` (see `reports/04-microservice-client-side.md`). Scale is an optional param.
10. SEO, accessibility, and polished UX/UI.
11. **Buy Me a Coffee** link + **GitHub** link + email credits in the menu/footer.
12. Elegant `README.md` and a simple **Terms & Conditions** ("free, use at your own risk, no liability").

## Tech stack (see `reports/01-stack-and-libraries.md` for full rationale)

- **Vite 6** + **TypeScript** (static `dist/` output)
- **React 19**
- **Tailwind CSS v4** (`@tailwindcss/vite`, OKLCH colors)
- **shadcn/ui** (components copied into `src/components/ui`, fully themeable)
- **pdfjs-dist** (canvas render → `canvas.toBlob('image/png')`)
- **vite-plugin-pwa** + **Workbox** (manifest, service worker, offline, install)
- **JSZip** (download-all ZIP)
- **lucide-react** (icons)
- **@fontsource-variable/space-grotesk** + **@fontsource-variable/inter** (self-hosted fonts)
- **Vitest** + **@testing-library/react** (tests), **Playwright** (optional e2e)
- **ESLint** + **Prettier**

> Always confirm latest compatible versions with `npm view <pkg> version` before
> installing, commit the lockfile, and let the CI **build** be the gate.

## Design conventions (NON-NEGOTIABLE — Moni's preferences)

- **NO borders** on UI elements. Use **elevation (shadow)** + subtle background
  tints for separation, never outlines. (Focus rings for a11y are the one exception.)
- **Hover = a small soft drop shadow** (a gentle "lift", optional tiny translate-up).
- **Contrasting** light/dark themes.
- **Fonts:** Space Grotesk (display/headings/logo), Inter (body/UI).
- **Accent palette:** electric **violet** (primary) + **cyan** (secondary), in OKLCH.
- All colors/spacing/radii/shadows/typography come from **design tokens** — see
  `design/` (`tokens.css` + `design-system.md`). Never hard-code a hex in a component.

## Code quality ("by the book")

- TypeScript **strict**; no `any`. Prefer small, single-purpose components/functions.
- **JSDoc** on exported functions/components and non-obvious logic.
- Keep files focused; split when a file grows large.
- Comments and all code/docs are in **English**. (Chat with Moni is in Bulgarian.)
- Lint + format clean before commit. No dead code.
- Conventional commits (`feat:`, `fix:`, `docs:`, `chore:`, `test:` …).

## Repository layout (intended)

```
/
├─ CLAUDE.md               ← this file
├─ README.md
├─ TERMS.md                ← terms & conditions (simple)
├─ reports/                ← research reports (read for context)
├─ design/                 ← design system: tokens.css, design-system.md, logo source
│  └─ logo/                ← master SVG + generated icon set
├─ public/                 ← static assets copied as-is (icons, robots.txt, og-image)
├─ src/
│  ├─ components/
│  │  ├─ ui/               ← shadcn components (generated)
│  │  └─ ...               ← app components (Dropzone, PageGrid, Menu, ThemeToggle, InstallPrompt…)
│  ├─ lib/                 ← pdf → png core, zip, utils, theme, service-mode/postMessage
│  ├─ hooks/
│  ├─ styles/              ← index.css importing tokens + tailwind
│  ├─ App.tsx
│  └─ main.tsx
├─ tests/                  ← unit/component (Vitest) + e2e (Playwright)
├─ .github/workflows/      ← deploy.yml (Pages) + ci.yml (lint/test/build)
├─ vite.config.ts          ← base: "/pdf-to-png/", react, tailwind, pwa plugins
└─ package.json
```

## GitHub Pages rules (see `reports/02-github-pages-and-pwa.md`)

- `vite.config.ts` **`base: "/pdf-to-png/"`** must match the repo name.
- Build asset URLs from `import.meta.env.BASE_URL` (PDF worker, manifest, icons).
- Manifest `start_url`/`scope`/`id` must include the base path.
- Deploy with GitHub Actions (`actions/deploy-pages`); Settings → Pages → Source: GitHub Actions.
- No router at launch (modals only). If routes are added later, use **HashRouter**.

## "Service" mode contract (see `reports/04`)

Query params: `url`, `scale` (0.1–1.0), `page`, `format=png`, `autodownload`, `embed`.
iframe messaging: `pdf2png:ready` / `:convert` / `:progress` / `:result` / `:error`.

## Definition of done

- Lighthouse: PWA installable; Performance / A11y / Best-Practices / SEO green.
- Works installed + offline; install prompt appears when not installed.
- Tests pass; CI green; deployed build verified on the live Pages URL.
- README + Terms present; credits + Buy Me a Coffee linked.
