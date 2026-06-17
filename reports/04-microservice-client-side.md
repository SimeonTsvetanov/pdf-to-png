# Report 04 — "Microservice" Mode (Client-Side) + Future Options

> Moni wants the converter to be usable **from other platforms** by sending a
> request and getting back the finished images, optionally passing a scale.
> GitHub Pages is static, so this report defines a realistic client-side design
> (the chosen approach) and documents a true-API Phase 2 for completeness.

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

## 3. Phase 2 (optional, NOT on GitHub Pages) — a real REST API

If a true `POST file → PNG/ZIP` endpoint is ever required:

- **Cloudflare Workers** (free tier, generous) running PDF rendering at the edge,
  or **Vercel / Netlify Functions**. Deployed separately; the PWA calls it via
  `fetch`.
- Endpoint sketch: `POST /api/convert` (multipart PDF + `?scale=`) →
  `200` with `image/png` (single page) or `application/zip` (multi-page).
- Keep the same parameter names (`scale`, `page`) for consistency with the
  client-side mode.

This is documented so the door stays open, but it is **out of scope for launch**
per Moni's decision (client-side only).

## 4. Sources

- Static site → PWA: https://dev.to/prorishi/your-static-site-to-a-pwa-24dl
- Service workers (MDN): https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- Dynamic image creation in SW: https://dev.to/maxart2501/dynamic-image-creation-with-service-workers-3l9h
