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
 * Runtime-agnostic PDF -> PNG API.
 *
 * The PDF can be sent two ways:
 *   1. RAW  — request body is the PDF bytes (Content-Type: application/pdf).
 *   2. JSON — body is { "pdf": "<base64>", "scale"?, "page"?, "format"? }.
 *             Use this from tools (e.g. n8n) where sending a raw binary body is
 *             awkward — base64 over JSON never corrupts the bytes.
 *
 * CORS is open so any site/platform can call it.
 */
export const app = new Hono();

app.use("*", cors());

/** Decode a base64 string to bytes (Node + Workers). */
function fromBase64(b64: string): Uint8Array {
  const clean = b64.includes(",") ? b64.slice(b64.indexOf(",") + 1) : b64;
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

interface Params {
  scale: number;
  page: string | null;
  format: string;
}

/** Read the PDF bytes + params from either a JSON or a raw request. */
async function readInput(
  c: import("hono").Context,
): Promise<{ data: Uint8Array; params: Params }> {
  const ct = c.req.header("content-type") ?? "";
  let data: Uint8Array;
  let body: Record<string, unknown> = {};

  if (ct.includes("application/json")) {
    body = (await c.req.json()) as Record<string, unknown>;
    const pdf = body.pdf ?? body.data ?? body.fileBase64;
    if (typeof pdf !== "string" || pdf.length === 0) {
      throw new Error("JSON body must include a base64 PDF in the 'pdf' field.");
    }
    data = fromBase64(pdf);
  } else {
    data = new Uint8Array(await c.req.arrayBuffer());
  }

  if (data.byteLength === 0) {
    throw new Error("Empty request body — no PDF received.");
  }

  const q = c.req.query();
  return {
    data,
    params: {
      scale: Number((body.scale as number | undefined) ?? q.scale ?? "1"),
      page: (body.page as string | undefined) ?? q.page ?? null,
      format: String((body.format as string | undefined) ?? q.format ?? "zip").toLowerCase(),
    },
  };
}

app.get("/", (c) =>
  c.json({
    name: "pdf-to-png-service",
    convert: "each PDF page -> its own PNG",
    send: "raw body (application/pdf) OR JSON { pdf: <base64>, scale?, page?, format? }",
    endpoints: {
      "POST /info": "PDF -> { pages }",
      "POST /page?index=&scale=": "PDF -> one image/png",
      "POST /convert?scale=&format=zip|json&page=all|n|a-b": "PDF -> zip or json",
    },
    scale: "0.1 to 1.0 (1.0 = full quality)",
  }),
);

app.post("/info", async (c) => {
  const { data } = await readInput(c);
  return c.json({ pages: getPageCount(data) });
});

app.post("/page", async (c) => {
  const { data, params } = await readInput(c);
  const index = Number(c.req.query("index") ?? "1");
  const r = renderPage(data, index, params.scale);
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
  const { data, params } = await readInput(c);
  const only = parsePageSpec(params.page);
  const pages = renderPages(data, params.scale, only);

  if (params.format === "json") {
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

// Return a helpful JSON error instead of a bare 500.
app.onError((err, c) => {
  return c.json({ ok: false, error: err instanceof Error ? err.message : String(err) }, 400);
});
