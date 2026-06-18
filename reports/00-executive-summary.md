# PDF→PNG PWA — Executive Summary (Research Report)

> Date: 2026-06-17 · Author: Claude (for Simeon "Moni" Tsvetanov)
> Status: Foundation research complete. This document is the entry point for the
> full report set in this folder.

## 1. What we are building

A **fully client-side Progressive Web App (PWA)** that converts PDF files into PNG
images. Each PDF page becomes its own PNG. If a PDF has N pages, the user can
download N separate PNGs (individually or all at once as a ZIP). The app is:

- **Free** and hosted on **GitHub Pages** (static hosting, no backend).
- **Installable** as a standalone app on Android, iOS/iPadOS, Windows, macOS, Linux.
- **Offline-capable** after first load (service worker + Workbox).
- **Beautiful and modern** — shadcn/ui components, custom design tokens, light/dark/system themes.
- **Privacy-first** — files never leave the device; all conversion happens in the browser.

## 2. Key product requirements (from Moni)

| # | Requirement | Decision |
|---|-------------|----------|
| 1 | PDF → PNG, one PNG per page | `pdf.js` renders each page to a `<canvas>`, exported via `canvas.toBlob('image/png')` |
| 2 | Download all pages separately | Individual downloads + "Download all as ZIP" (JSZip) |
| 3 | Scale option 0.0–1.0 (default 1.0 = full quality) | Maps to a render scale multiplier; documented in report 04 |
| 4 | No user accounts | None. Zero auth, zero tracking. |
| 5 | Light / Dark / System themes | `next-themes`-style toggle on top of design tokens |
| 6 | About / Help menus (hamburger or modern equivalent) | shadcn `Sheet` (mobile) + `DropdownMenu`/dialogs |
| 7 | Standalone PWA | `display: standalone` in manifest |
| 8 | Install prompt when not installed | `beforeinstallprompt` capture + custom prompt UI; iOS instructions fallback |
| 9 | Usable as a "microservice" by other platforms | **Client-side only** mode via URL params + iframe (see report 04) |
| 10 | Optional scale param in the service mode | `?scale=` query parameter |
| 11 | SEO + typography + UX/UI excellence | Report 03 |
| 12 | Buy Me a Coffee link | https://buymeacoffee.com/simeontsvetanov |
| 13 | Elegant README + Terms & Conditions | Simple, free, "use at your own risk" |
| 14 | Credits: email + GitHub | tsvetanov.simeon@gmail.com + GitHub profile |
| 15 | Logo by Claude, all icon formats | "PDF / PNG" stacked mark; full icon set (see design system) |
| 16 | No borders on elements; hover = subtle shadow | Encoded as a design-token convention |
| 17 | Contrasting themes, cool modern font | Space Grotesk (display) + Inter (UI/body) |

## 3. The "microservice" reality on GitHub Pages

GitHub Pages serves **static files only** — there is no server process to accept an
HTTP request and return generated PNGs. A true REST API (`POST file → returns PNG`)
is therefore impossible on Pages alone.

**Chosen approach (confirmed with Moni): client-side service mode.** The app accepts
URL parameters, e.g.:

```
https://<user>.github.io/pdf-to-png/?url=<pdf-url>&scale=0.75&autodownload=zip
```

It fetches the PDF (CORS permitting), converts it in the browser, and exposes the
results for download / `postMessage` to a parent window when embedded via `<iframe>`.
This keeps everything free, static, and private. Full design in **report 04**.

> **UPDATE (2026-06-18):** A real REST API was also **built and deployed** — see
> `service/` (Hono + MuPDF on **Node**, live on **Render**). Cloudflare Workers was
> tested and ruled out (MuPDF's WASM won't load there). Details in **report 04**.

## 4. Final stack (validated, latest stable as of June 2026)

See **report 01** for versions and compatibility evidence.

- **Build:** Vite 6 + TypeScript
- **UI:** React 19 + Tailwind CSS v4 (`@tailwindcss/vite`) + shadcn/ui
- **PDF engine:** `pdfjs-dist` v5.x (canvas rendering)
- **Packaging:** `vite-plugin-pwa` + Workbox (service worker, manifest, offline)
- **ZIP / download:** JSZip + a small file-saver helper
- **Fonts (self-hosted for offline):** `@fontsource-variable/space-grotesk` + `@fontsource-variable/inter`
- **Testing:** Vitest + React Testing Library (unit/component) + Playwright (e2e, optional)
- **Deploy:** GitHub Actions → GitHub Pages

## 5. Report index

- `00-executive-summary.md` — this file
- `01-stack-and-libraries.md` — every library, version, and why; compatibility matrix
- `02-github-pages-and-pwa.md` — deploy, base path, service worker, install prompt, icons
- `03-seo-ux-ui-typography.md` — SEO, accessibility, UX flows, typography, theming
- `04-microservice-client-side.md` — the URL/iframe service mode + the hosted Node API
- `05-risks-and-decisions.md` — open risks, trade-offs, and the decision log

## 6. Sources

- PDF.js / pdfjs-dist: https://mozilla.github.io/pdf.js/examples/ , https://www.nutrient.io/blog/complete-guide-to-pdfjs/
- vite-plugin-pwa: https://vite-pwa-org.netlify.app/ , https://github.com/vite-pwa/vite-plugin-pwa
- shadcn/ui + Tailwind v4: https://ui.shadcn.com/docs/tailwind-v4 , https://ui.shadcn.com/docs/installation/vite
- GitHub Pages SPA deploy: https://dev.to/rashidshamloo/deploying-vite-react-app-to-github-pages-35hf
- Fonts: https://fonts.google.com/knowledge/glossary/geometric , https://fontfyi.com/blog/best-sans-serif-fonts-2026/
