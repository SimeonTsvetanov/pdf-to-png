# Report 03 — SEO, UX/UI, Typography & Theming

> Making the app discoverable, beautiful, accessible, and on-brand.

## 1. SEO (for a single-page static app)

Even a SPA can rank well if the served HTML is meaningful:

- **`<title>` & meta description** — clear, keyword-aware:
  - Title: `PDF to PNG Converter — Free, Private, In-Browser`
  - Description: `Convert PDF pages to high-quality PNG images instantly. Each page becomes its own PNG. Free, no signup, files never leave your device.`
- **Open Graph + Twitter cards** — `og:title`, `og:description`, `og:image`
  (1200×630), `og:url`, `twitter:card=summary_large_image`. Drives nice link previews.
- **Canonical URL** — `<link rel="canonical" href="https://<user>.github.io/pdf-to-png/">`.
- **JSON-LD structured data** — `WebApplication` schema (name, description,
  `applicationCategory: Utility`, `offers: price 0`) for rich results.
- **`robots.txt` + `sitemap.xml`** — allow all, list the single canonical URL.
- **Semantic HTML** — real `<header>/<main>/<footer>`, one `<h1>`, descriptive
  `alt`/`aria-label`s, buttons that are `<button>`.
- **Performance = SEO** — Vite code-splitting, lazy-load `pdfjs-dist` only when a
  file is chosen, preconnect nothing external (fonts self-hosted), aim for green
  Core Web Vitals.

> Note: GitHub Pages doesn't do server-side rendering, but because the static
> `index.html` already contains the title/meta/JSON-LD, crawlers get what they need.

## 2. UX flows

**Primary flow (convert):**
1. Land → big, obvious drop zone ("Drop a PDF here or click to browse").
2. Drag-and-drop **or** file picker (accept `application/pdf`).
3. Show progress per page as it renders (skeletons / progress bar).
4. Result grid: each page as a thumbnail card with a "Download PNG" button.
5. Sticky action bar: **Download all (ZIP)**, **Clear**, scale slider.

**Scale control:** slider `0.1 → 1.0` (we avoid literal 0.0 = empty image; min 0.1),
default `1.0`. Live label shows resulting pixel dimensions of page 1 so the user
understands the trade-off (quality vs. file size). Tooltip explains "1.0 = full
quality".

**Empty/error states:** non-PDF dropped → friendly inline error. Corrupt/encrypted
PDF → clear message. Huge PDF → warn and render progressively.

**Menus:** hamburger → shadcn `Sheet` on mobile; top-right `DropdownMenu` on
desktop. Items: About, Help, Terms, Install app, **Buy me a coffee**, GitHub,
theme toggle.

## 3. Accessibility (a11y)

- Full keyboard operability; visible focus rings (focus ring is allowed even though
  borders aren't — it's an accessibility necessity).
- `aria-live` region announces conversion progress and completion.
- Color contrast ≥ WCAG AA in **both** themes (we verify token pairs).
- Respect `prefers-reduced-motion` (disable non-essential animation).
- Drop zone reachable and operable via keyboard (`<input type=file>` + label).

## 4. Typography (the "cool modern font")

**Pairing:**
- **Space Grotesk** — display / headings / logo wordmark. Geometric, technical,
  contemporary — gives the brand a distinct, modern character.
- **Inter** — body, UI, controls. The benchmark UI sans for on-screen legibility.

Both shipped as **variable** fonts via `@fontsource-variable/*` (offline-safe).

**Type scale (rem, 1.250 "major third"):**

| Token | Size | Use |
|-------|------|-----|
| `--fs-xs` | 0.75 | captions, hints |
| `--fs-sm` | 0.875 | secondary text |
| `--fs-base` | 1.0 | body |
| `--fs-lg` | 1.25 | lead text |
| `--fs-xl` | 1.563 | section heads |
| `--fs-2xl` | 1.953 | page heads |
| `--fs-3xl` | 2.441 | hero |
| `--fs-display` | 3.815 | logo / hero display |

Line-height: 1.5 body, 1.15 headings. Letter-spacing slightly tight on display.

## 5. Theming & the visual conventions Moni asked for

- **Light / Dark / System** themes, all driven by CSS variables (see the design
  system file). System theme follows `prefers-color-scheme`.
- **High contrast** between themes — dark is a near-black violet-tinted base with
  vivid violet/cyan accents; light is clean off-white with the same accent family.
- **NO borders** on cards/inputs/buttons. Separation is achieved with **elevation
  (shadow) and subtle background tints**, not outlines.
- **Hover = small drop shadow** beneath the element (a soft lift), plus a tiny
  translate-up. This is encoded as reusable utility classes / tokens so it's
  consistent everywhere.
- **Accent palette:** electric **violet** primary + **cyan** secondary, defined in
  OKLCH for vivid, even color.

## 6. Sources

- Geometric fonts: https://fonts.google.com/knowledge/glossary/geometric
- Best sans-serif 2026: https://fontfyi.com/blog/best-sans-serif-fonts-2026/
- 2026 Google fonts roundup: https://madegooddesigns.com/best-google-fonts/
- PWA UX/enhancements: https://web.dev/learn/pwa/enhancements
