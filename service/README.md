# PDF → PNG — Service API

A tiny, free **HTTP API** that converts each PDF page into its own PNG, for
**server-to-server** use (n8n, Zapier, Make, your own backend) — the cases where the
browser app can’t help because there’s no browser.

- **Engine:** [MuPDF](https://mupdf.com) (WASM) — renders PDF pages to PNG.
- **Framework:** [Hono](https://hono.dev) — runs on **Node** and **Cloudflare Workers**.
- **Stateless:** send the PDF, get images back. Nothing is stored.

> The main app at `https://simeontsvetanov.github.io/pdf-to-png/` stays 100%
> client-side. This API is **optional** and only needed for server-side callers.

## Endpoints

Send the PDF as the **raw request body** with `Content-Type: application/pdf`.
`scale` is the quality, `0.1`–`1.0` (`1.0` = full quality).

| Method & path | Body | Returns |
|---|---|---|
| `GET /` | — | JSON usage/help |
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
# test it:
curl -s -X POST --data-binary @file.pdf -H "content-type: application/pdf" localhost:8787/info
curl -s -X POST --data-binary @file.pdf -H "content-type: application/pdf" "localhost:8787/convert?scale=0.8" -o out.zip
```

## Deploy free — Cloudflare Workers

```bash
cd service
npm install
npx wrangler login
npm run deploy         # prints your https://pdf-to-png-service.<you>.workers.dev URL
```

> If MuPDF’s WASM has trouble on Workers on your account, deploy the **Node** entry
> (`src/node.ts`) to any free Node host (Render, Railway, Fly.io) instead — the API
> is identical. The Node path is the one verified during development.

## Use from n8n

### Quick way — HTTP Request node

- **Method:** `POST`
- **URL:** `https://your-service.workers.dev/convert?format=json&scale=1`
- **Body:** *Binary* → your PDF, with header `Content-Type: application/pdf`
- **Response:** `{ count, pages: [{ index, width, height, dataUrl }] }`

Then a small Code node turns the data URLs into binary items if you need files:

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
never hit n8n’s execution timeout or a Worker’s CPU limit. Add a short wait between
pages if you like. Paste this into a **Code node**:

```js
// n8n Code node — convert page-by-page to avoid timeouts on big PDFs.
const API = "https://your-service.workers.dev";
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

  // optional: be gentle / dodge rate limits
  await new Promise((r) => setTimeout(r, 100));
}

return out;
```

> Prefer n8n’s visual loop? Use **HTTP Request → `/info`**, then a **Loop Over Items**
> (or Split In Batches) over `1..pages`, an **HTTP Request → `/page?index={{$json.i}}`**
> inside it, and an optional **Wait** node between iterations.

## License

MIT — see the repository root.
