# Report 04 — "Microservice" Mode (Client-Side) + Hosted API

> Moni wants the converter to be usable **from other platforms** by sending a
> request and getting back the finished images, optionally passing a scale.
> GitHub Pages is static, so this report defines a realistic client-side design
> **and** the hosted HTTP API that was subsequently built.

> **UPDATE — 2026-06-18:** The "Phase 2" real API has been **built and deployed**.
> It lives in `service/` (Hono + **MuPDF WASM**), runs on **Node**, and is live on
> **Render** at `https://pdf-to-png-service-i3sb.onrender.com`. Important finding:
> **Cloudflare Workers is NOT viable** — MuPDF's WASM fails to load in the Workers
> runtime (`createRequire`/path error), so a Node/container host is required. The
> API accepts the PDF as a raw body *or* as base64 JSON; n8n must use base64 JSON
> because n8n corrupts raw binary request bodies. Endpoints and n8n examples are in
> `service/README.md` and in the app under **menu → "Use as a service"**.

## 1. Why not a classic REST API on Pages

GitHub Pages only serves static files. There is no process to run
`POST /convert` and return PNG bytes. So the "service" must run **in the client's
browser** — either the user's, or a host page that embeds ours.

## 2. Chosen approach — URL-parameter + iframe service mode

The app reads query parameters on load and can run fully automatically.

### Supported parameters

| Param | Values | Default | Meaning |
|-------|--------|---------|---------|
| `url` | encoded PDF URL | — | Remote PDF to fetch & convert (CORS must allow it) |
| `scale` | `0.1`–`1.0` | `1.0` | Render scale (quality) |
| `page` | `n` or `a-b` or `all` | `all` | Which pages to output |
| `format` | `png` | `png` | Output format (PNG today) |
| `autodownload` | `zip` \| `each` \| `off` | `off` | Auto-download behavior |
| `embed` | `1` | `0` | Hide chrome/menus for clean iframe embedding |

### Example

```
https://<user>.github.io/pdf-to-png/?url=https%3A%2F%2Fexample.com%2Ffile.pdf&scale=0.75&autodownload=zip
```

### Embedding from another platform (`<iframe>` + postMessage)

A host page can embed the converter and receive results via `postMessage`:

```html
<iframe id="conv" src="https://<user>.github.io/pdf-to-png/?embed=1"></iframe>
<script>
  const frame = document.getElementById("conv");
  // Send a job once the iframe signals it's ready:
  window.addEventListener("message", (e) => {
    if (e.origin !== "https://<user>.github.io") return;
    if (e.data?.type === "pdf2png:ready") {
      frame.contentWindow.postMessage(
        { type: "pdf2png:convert", url: "https://example.com/file.pdf", scale: 0.75 },
        "https://<user>.github.io"
      );
    }
    if (e.data?.type === "pdf2png:result") {
      // e.data.pages = [{ index, dataUrl, width, height }, ...]
      console.log("Got", e.data.pages.length, "PNGs");
    }
    if (e.data?.type === "pdf2png:error") console.error(e.data.message);
  });
</script>
```

### Message contract (documented & versioned)

- **From host → app:** `{ type: "pdf2png:convert", url?, fileBase64?, scale?, pages? }`
- **App → host:** `pdf2png:ready`, `pdf2png:progress` `{done,total}`,
  `pdf2png:result` `{pages:[{index,dataUrl,width,height}]}`, `pdf2png:error` `{message}`.

This gives other platforms a clean, documented integration without any backend.

### Constraints (be honest about them)

- **CORS:** fetching a remote `url` requires that server to allow cross-origin
  reads. If it doesn't, the host should pass the PDF as base64 via `postMessage`
  instead.
- **Cross-origin downloads:** browsers may block silent auto-downloads in some
  embed contexts; `postMessage` results are the robust path.
- **Compute is the client's** — large PDFs use the visitor's CPU/RAM.

## 3. The hosted REST API — BUILT (`service/`)

A true `POST PDF → PNG/ZIP` endpoint now exists for server-side callers:

- **Engine:** **MuPDF (WASM)** renders pages to PNG. **Framework:** **Hono**
  (runtime-agnostic). **Runtime:** **Node** (verified end-to-end).
- **Hosting:** **Render** free tier via Docker (`service/Dockerfile` +
  `render.yaml` blueprint, auto-deploy on push). Any Node/container host works
  (Koyeb, Fly, Railway). Live at `https://pdf-to-png-service-i3sb.onrender.com`.
- **Endpoints:** `POST /info` → `{ pages }`; `POST /page?index=&scale=` → one
  `image/png`; `POST /convert?scale=&format=zip|json&page=` → ZIP or JSON. Same
  parameter names as the client-side mode.
- **Input:** raw body (`application/pdf`) **or** base64 JSON `{ pdf, scale?, … }`.
- **Why not Cloudflare Workers:** tested and rejected — MuPDF's WASM does not load
  in the Workers runtime. A Node/container host is required.
- **n8n note:** n8n corrupts raw binary request bodies, so callers should send
  base64 JSON. Ready-to-paste n8n nodes are bundled (`src/lib/n8n-workflow.json`,
  surfaced via the app's "Copy n8n nodes" button).

> Free Render instances sleep after ~15 min idle (first request wakes in ~50 s).
> For always-warm free hosting, Koyeb runs the same Dockerfile.

## 4. Sources

- Static site → PWA: https://dev.to/prorishi/your-static-site-to-a-pwa-24dl
- Service workers (MDN): https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- Dynamic image creation in SW: https://dev.to/maxart2501/dynamic-image-creation-with-service-workers-3l9h
