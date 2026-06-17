# Report 02 — GitHub Pages Deployment & PWA

> How we ship a static, installable, offline-capable app on GitHub Pages, and the
> install-prompt UX.

## 1. Base path — the #1 gotcha

A project site lives at `https://<user>.github.io/<repo>/`, so **everything must be
prefixed with the repo name**. In `vite.config.ts`:

```ts
export default defineConfig({
  base: "/pdf-to-png/", // MUST match the repo name exactly
  // ...
});
```

Then always build asset URLs from `import.meta.env.BASE_URL` (the PDF.js worker,
the manifest icons, the install logic). Hard-coding `/` will break on Pages.

## 2. Deploy via GitHub Actions (recommended over `gh-pages` branch)

Modern GitHub Pages supports deploying straight from an Actions workflow with the
official Pages actions. Outline:

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages
on:
  push: { branches: [main] }
  workflow_dispatch:
permissions: { contents: read, pages: write, id-token: write }
concurrency: { group: "pages", cancel-in-progress: true }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build        # vite build → dist/
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: "${{ steps.deployment.outputs.page_url }}" }
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

In the repo: **Settings → Pages → Build and deployment → Source: GitHub Actions.**

## 3. SPA 404 handling (only if we add a router)

GitHub Pages can't rewrite unknown paths to `index.html`. Two safe options:

1. **HashRouter** — URLs use `#/about`; Pages never sees the sub-path. Zero config. ✅ default if we ever need routes.
2. **404.html copy** — copy `dist/index.html → dist/404.html` in the build, plus a redirect script. More work, prettier URLs.

Our current plan uses **no router** (modals only), so this is a non-issue at launch.

## 4. PWA manifest (web app manifest)

`vite-plugin-pwa` generates `manifest.webmanifest`. Key fields:

```jsonc
{
  "name": "PDF to PNG — Convert & Download",
  "short_name": "PDF→PNG",
  "description": "Convert PDF pages to PNG images, right in your browser. Free & private.",
  "id": "/pdf-to-png/",
  "start_url": "/pdf-to-png/",
  "scope": "/pdf-to-png/",
  "display": "standalone",
  "background_color": "#0b0b12",
  "theme_color": "#7c3aed",
  "orientation": "any",
  "categories": ["utilities", "productivity"],
  "icons": [ /* see icon set below */ ],
  "screenshots": [ /* wide + narrow for richer install UI */ ],
  "shortcuts": [
    { "name": "Convert a PDF", "url": "/pdf-to-png/?action=open" }
  ]
}
```

## 5. Icon set (what files we generate)

For broad install support across Android, iOS, Windows, and desktop, generate from
one master SVG:

| File | Size | Purpose |
|------|------|---------|
| `favicon.svg` | vector | Modern browsers (scales perfectly) |
| `favicon.ico` | 16/32/48 | Legacy fallback |
| `pwa-192x192.png` | 192 | Android home screen |
| `pwa-512x512.png` | 512 | Android splash / store |
| `pwa-maskable-192.png` | 192 | Maskable (safe-zone padded) |
| `pwa-maskable-512.png` | 512 | Maskable (safe-zone padded) |
| `apple-touch-icon.png` | 180 | iOS home screen (no transparency) |
| `apple-touch-icon-167.png` | 167 | iPad Pro |
| `apple-touch-icon-152.png` | 152 | iPad |
| `og-image.png` | 1200×630 | Social share / SEO |

> **Maskable vs. any:** Android may crop icons into circles/squircles. Maskable
> icons include a ~20% safe-zone margin so the logo never gets clipped. We ship
> both `purpose: "any"` and `purpose: "maskable"` variants.

The `pwa-assets-generator` (companion to vite-plugin-pwa) or a simple
`sharp`/`resvg` script can produce all PNGs from the master SVG in CI.

## 6. Install prompt UX (the "install me" menu)

Requirement: when the app is **not installed**, show a prompt offering installation.

**Android / Chromium desktop:** the browser fires `beforeinstallprompt`. We:

1. `preventDefault()` and stash the event.
2. Show our own styled banner/button ("Install PDF→PNG").
3. On click, call `event.prompt()` and read `userChoice`.
4. Hide the banner after install (`appinstalled` event) or if already running standalone.

**iOS / iPadOS (Safari):** there is **no** `beforeinstallprompt`. Detect iOS +
non-standalone and show instructions: "Tap Share → Add to Home Screen."

**Already installed?** Detect with
`window.matchMedia('(display-mode: standalone)').matches` (and iOS
`navigator.standalone`) and suppress the prompt entirely.

We also respect a "dismissed" flag (in-memory/localStorage) so we don't nag users
who declined.

## 7. Offline strategy

- **Precache** the app shell (HTML/CSS/JS/fonts/icons) via Workbox — the app opens
  offline after first visit.
- **No runtime data caching needed** for core conversion (it's all local compute).
- **Auto-update:** `registerType: 'autoUpdate'` + a small toast: "New version available — reload."

## 8. Sources

- vite-plugin-pwa guide: https://vite-pwa-org.netlify.app/
- vite-plugin-pwa React docs: https://github.com/vite-pwa/vite-plugin-pwa/blob/main/docs/frameworks/react.md
- GH Pages SPA / 404: https://dev.to/lico/handling-404-error-in-spa-deployed-on-github-pages-246p
- Vite → GH Pages: https://dev.to/rashidshamloo/deploying-vite-react-app-to-github-pages-35hf
- PWA install & enhancements: https://web.dev/learn/pwa/enhancements , https://web.dev/learn/pwa/assets-and-data
