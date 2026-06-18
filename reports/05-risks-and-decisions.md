# Report 05 — Risks, Trade-offs & Decision Log

## 1. Decision log

| # | Decision | Rationale | Date |
|---|----------|-----------|------|
| D1 | Client-side only (no backend) | GitHub Pages is static; keeps it free & private; confirmed by Moni | 2026-06-17 |
| D2 | Vite 6 + React 19 + TS | Modern, GH-Pages-friendly, shadcn-compatible | 2026-06-17 |
| D3 | Tailwind v4 + shadcn/ui | Own the components; OKLCH theming; no runtime lock-in | 2026-06-17 |
| D4 | pdfjs-dist for rendering | Canonical, reliable, browser-native canvas → PNG | 2026-06-17 |
| D5 | vite-plugin-pwa + Workbox | Standard, low-config PWA + offline + install | 2026-06-17 |
| D6 | No router at launch (modals only) | Single-screen app; avoids GH Pages 404 complexity | 2026-06-17 |
| D7 | Accent: electric violet + cyan | Modern, premium, high contrast; chosen for Moni | 2026-06-17 |
| D8 | Fonts: Space Grotesk + Inter (self-hosted) | Modern display + best UI body; offline-safe | 2026-06-17 |
| D9 | No borders; hover = soft shadow lift | Explicit user style preference | 2026-06-17 |
| D10 | Service mode via URL params + iframe postMessage | Only viable "API" on static hosting | 2026-06-17 |

## 2. Risks & mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Base-path bugs (worker/manifest/icons 404 on Pages) | App broken in prod | Always use `import.meta.env.BASE_URL`; test the deployed build, not just `dev` |
| Large PDFs freeze the UI | Bad UX, tab crash | Render progressively, show progress, consider OffscreenCanvas/worker; cap dimensions |
| Tailwind v4 bleeding-edge browser features | Old browsers break | Target modern browsers (PWA audience); document baseline |
| `pdfjs-dist` worker version mismatch | Render fails silently | Pin worker version to the API version; bundle the worker, don't CDN it |
| CORS blocks remote `?url=` fetch | Service mode fails | Document the limit; support base64 via postMessage |
| iOS PWA limitations (no install prompt event) | Confusing install UX | Detect iOS, show "Add to Home Screen" instructions |
| Version drift between libs | Build breaks | Pin exact versions; lockfile committed; CI build is the gate |
| Auto-download blocked in iframe | Service mode partial | Default to postMessage results, not silent downloads |

## 3. Quality gates ("by the book")

- ESLint + Prettier clean; TypeScript strict mode, no `any`.
- File/length conventions: components small and single-purpose; functions documented
  with JSDoc; max sensible file length (split when large).
- Unit tests for the PDF→PNG core (scale math, page count, blob creation) and for
  utility/hooks; component tests for the converter UI; optional Playwright e2e for
  the happy path.
- Lighthouse: PWA installable, Performance/Best-Practices/SEO/Accessibility all
  green before "done".
- CI runs lint + typecheck + tests + build on every push.

## 4. Open questions for later

- Do we want PWA **screenshots** (richer install dialog)? — nice-to-have.
- Add JPG/WEBP output later? — easy extension of the canvas export.
- ~~Add a real REST API (Phase 2, Cloudflare Workers)?~~ — **DONE (2026-06-18).**

## 5. Update log

- **2026-06-18 — Hosted API built & deployed.** Added `service/` (Hono + **MuPDF
  WASM** on **Node**), live on **Render** (`pdf-to-png-service-i3sb.onrender.com`),
  auto-deploy via `render.yaml`. Endpoints: `/info`, `/page`, `/convert`.
  - **Decision reversed:** **Cloudflare Workers ruled out** — MuPDF's WASM fails to
    load in the Workers runtime. Use a Node/container host instead.
  - **Decision:** the API accepts base64 JSON in addition to a raw body, because
    n8n corrupts raw binary request bodies (caused a `500`). n8n examples + a
    "Copy n8n nodes" button (`src/lib/n8n-workflow.json`) were added to the app.
  - **Risk:** Render free tier sleeps after ~15 min idle (~50 s cold start). Mitigate
    with Koyeb (always-warm, same Dockerfile) or a paid instance if needed.
