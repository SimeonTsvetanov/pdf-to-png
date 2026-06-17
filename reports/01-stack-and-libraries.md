# Report 01 — Stack & Libraries

> Goal: pick the most modern, mutually-compatible, GitHub-Pages-friendly stack,
> using the latest stable versions available as of **June 2026**, and document
> *why* each piece was chosen.

## 1. Compatibility matrix (the short version)

| Layer | Choice | Version (Jun 2026) | Works on GH Pages? | Notes |
|-------|--------|--------------------|--------------------|-------|
| Bundler | **Vite** | 6.x | ✅ static output | Fast, first-class PWA + Tailwind plugins |
| UI lib | **React** | 19.x | ✅ | shadcn/ui targets React 19 |
| Language | **TypeScript** | 5.x | ✅ | Type-safety = "textbook" code quality |
| Styling | **Tailwind CSS** | v4 (`@tailwindcss/vite`) | ✅ | OKLCH colors, CSS-first config |
| Components | **shadcn/ui** | latest CLI | ✅ | Copy-in components, fully themeable, no runtime lock-in |
| PDF engine | **pdfjs-dist** | 5.x (~5.6) | ✅ runs in browser | Canvas render → PNG |
| PWA | **vite-plugin-pwa** | 1.x | ✅ | Workbox 7 under the hood |
| Service worker | **Workbox** | 7.x | ✅ | Precache + runtime caching |
| ZIP | **JSZip** | 3.x | ✅ | "Download all as ZIP" |
| Icons (UI) | **lucide-react** | latest | ✅ | shadcn's default icon set |
| Fonts | **@fontsource-variable** | Inter + Space Grotesk | ✅ self-hosted | Offline-safe, no Google CDN dependency |
| Unit tests | **Vitest** + **@testing-library/react** | latest | n/a (CI) | Fast, Vite-native |
| E2E tests | **Playwright** | latest | n/a (CI) | Optional but recommended |
| Lint/format | **ESLint** + **Prettier** | latest | n/a | Enforces "by-the-book" style |

> ⚠️ **Verify before install.** Versions above are the research baseline. During
> scaffolding we will pin exact versions from `npm view <pkg> version` and run a
> real build to confirm they interoperate. Tailwind v4 uses bleeding-edge browser
> features — fine for modern browsers, which is our target.

## 2. Why each choice

### Vite 6
Produces a fully static `dist/` (HTML/CSS/JS) — exactly what GitHub Pages serves.
Has official integrations for both Tailwind v4 (`@tailwindcss/vite`) and PWA
(`vite-plugin-pwa`), so configuration stays minimal and "textbook".

### React 19 + TypeScript
shadcn/ui's current components are built for React 19 (refs simplified, every
primitive carries a `data-slot` attribute for styling). TypeScript gives us the
strict, self-documenting code the brief asks for.

### Tailwind CSS v4 + shadcn/ui
Tailwind v4 moves config into CSS (`@import "tailwindcss"`) and uses **OKLCH**
colors, which give perceptually-even, vivid palettes — perfect for the contrasting
light/dark themes requested. shadcn/ui is not a dependency you ship; it copies
accessible component source into the repo, so we own and can restyle everything
(e.g. enforce the "no border, hover shadow" rule globally).

### pdfjs-dist (PDF.js)
The canonical, Mozilla-maintained PDF renderer. Flow per page:

```
const pdf = await pdfjsLib.getDocument({ data }).promise;
const page = await pdf.getPage(pageNumber);
const viewport = page.getViewport({ scale: renderScale });
canvas.width = viewport.width; canvas.height = viewport.height;
await page.render({ canvasContext: ctx, viewport }).promise;
canvas.toBlob((blob) => { /* PNG blob → download */ }, "image/png");
```

The worker (`pdf.worker.min.mjs`) must be bundled and referenced with a
**base-path-aware** URL so it loads correctly under `/pdf-to-png/` on Pages.

### vite-plugin-pwa + Workbox 7
Generates the service worker, injects the web app manifest, precaches the build,
and enables offline use + "install" support. `registerType: 'autoUpdate'` with a
small "new version available" prompt is the modern default.

### JSZip
Bundles all generated PNGs into one `.zip` for the "download all pages" feature,
entirely in the browser.

### Fonts via @fontsource-variable
Self-hosting Inter + Space Grotesk as variable fonts means no runtime call to
Google's CDN — required for true offline PWA behavior and better privacy/perf.

## 3. Routing decision

The app is essentially **one screen** with About/Help/Terms as dialogs/sheets, so a
router is optional. If we add routes later, **HashRouter** is the safest choice on
GitHub Pages (no 404 rewrite needed). If we use BrowserRouter, we must copy
`index.html → 404.html` at build time and set the correct `base`. Default plan:
**no router now**, modals only; revisit if needed.

## 4. Things to validate during build (checklist)

- [ ] `pdf.worker` loads under the GH Pages base path (`import.meta.env.BASE_URL`).
- [ ] `vite-plugin-pwa` manifest `scope`/`start_url` respect the base path.
- [ ] Tailwind v4 + shadcn init succeed together on the pinned versions.
- [ ] Large PDFs render without freezing the UI (consider an OffscreenCanvas / chunked rendering).
- [ ] `canvas.toBlob` PNG output matches the selected scale.

## 5. Sources

- PDF.js examples: https://mozilla.github.io/pdf.js/examples/
- PDF.js complete guide (versions, worker, pitfalls): https://www.nutrient.io/blog/complete-guide-to-pdfjs/
- shadcn/ui Tailwind v4: https://ui.shadcn.com/docs/tailwind-v4
- shadcn/ui Vite install: https://ui.shadcn.com/docs/installation/vite
- vite-plugin-pwa: https://vite-pwa-org.netlify.app/ , https://github.com/vite-pwa/vite-plugin-pwa
