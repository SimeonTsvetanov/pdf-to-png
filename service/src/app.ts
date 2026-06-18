import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  getPageCount,
  parsePageSpec,
  renderPage,
  renderPages,
  toBase64,
  zipPages,
} from "./render.js";

/**
 * Runtime-agnostic PDF -> PNG API. Send the PDF as the raw request body
 * (Content-Type: application/pdf). CORS is open so any site/platform can call it.
 */
export const app = new Hono();

app.use("*", cors());

app.get("/", (c) =>
  c.json({
    name: "pdf-to-png-service",
    convert: "each PDF page -> its own PNG",
    endpoints: {
      "POST /info": "raw PDF body -> { pages }",
      "POST /page?index=&scale=": "raw PDF body -> one image/png",
      "POST /convert?scale=&format=zip|json&page=all|n|a-b": "raw PDF body -> zip or json",
    },
    scale: "0.1 to 1.0 (1.0 = full quality)",
  }),
);

app.post("/info", async (c) => {
  const data = new Uint8Array(await c.req.arrayBuffer());
  return c.json({ pages: getPageCount(data) });
});

app.post("/page", async (c) => {
  const index = Number(c.req.query("index") ?? "1");
  const scale = Number(c.req.query("scale") ?? "1");
  const data = new Uint8Array(await c.req.arrayBuffer());
  const r = renderPage(data, index, scale);
  return new Response(r.png, {
    headers: {
      "content-type": "image/png",
      "x-page-index": String(r.index),
      "x-page-width": String(r.width),
      "x-page-height": String(r.height),
    },
  });
});

app.post("/convert", async (c) => {
  const scale = Number(c.req.query("scale") ?? "1");
  const format = (c.req.query("format") ?? "zip").toLowerCase();
  const only = parsePageSpec(c.req.query("page"));
  const data = new Uint8Array(await c.req.arrayBuffer());
  const pages = renderPages(data, scale, only);

  if (format === "json") {
    return c.json({
      count: pages.length,
      pages: pages.map((p) => ({
        index: p.index,
        width: p.width,
        height: p.height,
        dataUrl: `data:image/png;base64,${toBase64(p.png)}`,
      })),
    });
  }

  const zip = await zipPages(pages, "pdf");
  return new Response(zip, {
    headers: {
      "content-type": "application/zip",
      "content-disposition": 'attachment; filename="pdf-png.zip"',
    },
  });
});
