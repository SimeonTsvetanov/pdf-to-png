# PDF → PNG — Service API

A tiny, free **HTTP API** that converts each PDF page into its own PNG, for
**server-to-server** use (n8n, Zapier, Make, your own backend) — the cases where the
browser app can’t help because there’s no browser.

- **Engine:** [MuPDF](https://mupdf.com) — renders PDF pages to PNG.
- **Framework:** [Hono](https://hono.dev) on **Node.js**.
- **Stateless:** send the PDF, get images back. Nothing is stored, no accounts.

> ### Deploy once → everyone uses it
> You (just once) host this API and get **one permanent URL**. From then on **anyone**
> — your n8n, a colleague’s n8n, any backend — sends PDFs to that same URL and gets
> PNGs back. Nobody else deploys anything. One instance serves everyone.

> The main app at `https://simeontsvetanov.github.io/pdf-to-png/` stays 100%
> client-side and is separate from this. This API is **optional** — only needed for
> server-side callers.

## Endpoints

Send the PDF as the **raw request body** with `Content-Type: application/pdf`.
`scale` is the quality, `0.1`–`1.0` (`1.0` = full quality).

| Method & path | Body | Returns |
|---|---|---|
| `GET /` | — | JSON usage/help (also a health check) |
| `POST /info` | PDF bytes | `{ "pages": N }` |
| `POST /page?index=K&scale=S` | PDF bytes | one `image/png` (page `K`) |
| `POST /convert?scale=S&format=zip\|json&page=all\|n\|a-b` | PDF bytes | `application/zip` (default) or JSON with base64 data URLs |

`POST /convert?format=json` returns:

```json
{ "count": 3, "pages": [{ "index": 1, "width": 1190, "height": 1684, "dataUrl": "data:image/png;base64,..." }] }
```

## Run locally

```bash
cd service
npm install
npm run start          # http://localhost:8787
curl -s -X POST --data-binary @file.pdf -H "content-type: application/pdf" localhost:8787/info
```

## Deploy free (recommended: Render — no credit card)

The API is a small Node service with a `Dockerfile`, so it runs on any container
host. The easiest free, card-free option is **Render**:

1. Push this repo to GitHub (already done).
2. Go to [render.com](https://render.com) → **New + → Blueprint** → pick this repo.
   It reads [`render.yaml`](../render.yaml), builds `service/Dockerfile`, and gives
   you a permanent URL like `https://pdf-to-png-service.onrender.com`.
3. **autoDeploy is on** → every push to `main` redeploys automatically. Set up once,
   then forget it.

> Render’s free tier sleeps after ~15 min idle, so the *first* request after a quiet
> period takes ~30–60 s to wake up (fine for automations). Want always-warm and free?
> **[Koyeb](https://koyeb.com)** also runs the same `Dockerfile` with no card.

> **Cloudflare Workers is not supported** — MuPDF’s WASM doesn’t load in the Workers
> runtime (verified). Use a Node/container host (above).

Once deployed, copy your URL into your n8n nodes (and, optionally, replace the
`your-service.workers.dev` placeholder in `src/components/dialogs/ServiceDialog.tsx`).

## Use from n8n

### Quick way — HTTP Request node

- **Method:** `POST`
- **URL:** `https://YOUR-SERVICE-URL/convert?format=json&scale=1`
- **Body:** *Binary* → your PDF, with header `Content-Type: application/pdf`
- **Response:** `{ count, pages: [{ index, width, height, dataUrl }] }`

Turn the data URLs into binary files with a small Code node:

```js
return items[0].json.pages.map((p) => ({
  json: { page: p.index, width: p.width, height: p.height },
  binary: {
    data: {
      data: p.dataUrl.split(",")[1], // base64 part
      mimeType: "image/png",
      fileName: `page-${p.index}.png`,
    },
  },
}));
```

### Big PDFs — loop page-by-page (no timeouts)

Render **one page per request** inside a loop. Each call is small and fast, so you
never hit n8n’s execution timeout. Paste this into a **Code node**:

```js
// n8n Code node — convert page-by-page to avoid timeouts on big PDFs.
const API = "https://YOUR-SERVICE-URL";
const pdf = $binary.data;                 // incoming binary PDF on this item
const buf = Buffer.from(pdf.data, "base64");

// 1) how many pages?
const info = await this.helpers.httpRequest({
  method: "POST",
  url: `${API}/info`,
  body: buf,
  headers: { "content-type": "application/pdf" },
  json: true,
});

// 2) render each page in turn
const out = [];
for (let i = 1; i <= info.pages; i++) {
  const png = await this.helpers.httpRequest({
    method: "POST",
    url: `${API}/page?index=${i}&scale=0.8`,
    body: buf,
    headers: { "content-type": "application/pdf" },
    encoding: "arraybuffer", // raw PNG bytes
  });

  out.push({
    json: { page: i },
    binary: {
      data: await this.helpers.prepareBinaryData(
        Buffer.from(png),
        `page-${i}.png`,
        "image/png",
      ),
    },
  });

  await new Promise((r) => setTimeout(r, 100)); // optional small pause
}

return out;
```

> Prefer n8n’s visual loop? **HTTP Request → `/info`**, then **Loop Over Items** over
> `1..pages`, an **HTTP Request → `/page?index={{$json.i}}`** inside it, and an
> optional **Wait** node between iterations.

## License

MIT — see the repository root.
