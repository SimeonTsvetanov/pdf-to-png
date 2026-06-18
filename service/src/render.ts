import * as mupdf from "mupdf";
import JSZip from "jszip";

/** quality(1.0) -> mupdf scale. 2.0 ~= 144 DPI, crisp output. */
export const BASE_SCALE = 2.0;

/**
 * Clamp a quality value into the supported range.
 *
 * @param q - Raw quality value.
 * @returns Quality clamped to [0.1, 1.0]; NaN becomes 1.0.
 */
export function clampQuality(q: number): number {
  if (Number.isNaN(q)) return 1;
  return Math.min(1, Math.max(0.1, q));
}

/** A rendered page. */
export interface RenderedPage {
  index: number;
  png: Uint8Array;
  width: number;
  height: number;
}

function open(data: Uint8Array): mupdf.PDFDocument {
  return mupdf.Document.openDocument(data, "application/pdf") as mupdf.PDFDocument;
}

/**
 * Count pages in a PDF.
 *
 * @param data - PDF bytes.
 * @returns Page count.
 */
export function getPageCount(data: Uint8Array): number {
  return open(data).countPages();
}

function renderOne(doc: mupdf.PDFDocument, index1: number, quality: number): RenderedPage {
  const scale = clampQuality(quality) * BASE_SCALE;
  const page = doc.loadPage(index1 - 1);
  const pix = page.toPixmap(
    mupdf.Matrix.scale(scale, scale),
    mupdf.ColorSpace.DeviceRGB,
    false,
    true,
  );
  return { index: index1, png: pix.asPNG(), width: pix.getWidth(), height: pix.getHeight() };
}

/**
 * Render a single page to PNG.
 *
 * @param data - PDF bytes.
 * @param index1 - 1-based page index.
 * @param quality - 0.1–1.0.
 */
export function renderPage(data: Uint8Array, index1: number, quality: number): RenderedPage {
  return renderOne(open(data), index1, quality);
}

/**
 * Render multiple pages to PNG.
 *
 * @param data - PDF bytes.
 * @param quality - 0.1–1.0.
 * @param only - Optional explicit list of 1-based page numbers (defaults to all).
 */
export function renderPages(data: Uint8Array, quality: number, only?: number[]): RenderedPage[] {
  const doc = open(data);
  const n = doc.countPages();
  const list = only && only.length ? only : Array.from({ length: n }, (_, i) => i + 1);
  const out: RenderedPage[] = [];
  for (const idx of list) {
    if (idx >= 1 && idx <= n) out.push(renderOne(doc, idx, quality));
  }
  return out;
}

/**
 * Parse "all" | "3" | "1-4,7" into a sorted, de-duplicated page list.
 *
 * @param raw - Raw `page` parameter.
 * @returns Page list, or undefined for "all".
 */
export function parsePageSpec(raw: string | null | undefined): number[] | undefined {
  if (!raw || raw.trim().toLowerCase() === "all") return undefined;
  const set = new Set<number>();
  for (const part of raw.split(",")) {
    const seg = part.trim();
    const range = seg.match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) {
      const a = Number(range[1]);
      const b = Number(range[2]);
      for (let n = Math.min(a, b); n <= Math.max(a, b); n++) if (n >= 1) set.add(n);
    } else if (/^\d+$/.test(seg)) {
      const n = Number(seg);
      if (n >= 1) set.add(n);
    }
  }
  return [...set].sort((a, b) => a - b);
}

/**
 * Bundle rendered pages into a ZIP.
 *
 * @param pages - Rendered pages.
 * @param baseName - Base name for the files inside the archive.
 * @returns ZIP bytes.
 */
export async function zipPages(pages: RenderedPage[], baseName: string): Promise<Uint8Array> {
  const zip = new JSZip();
  const width = String(pages.length).length;
  for (const p of pages) {
    zip.file(`${baseName}-page-${String(p.index).padStart(width, "0")}.png`, p.png);
  }
  return zip.generateAsync({ type: "uint8array", compression: "DEFLATE" });
}

/**
 * Base64-encode bytes (works in both Node and Workers, no Buffer needed).
 *
 * @param bytes - Input bytes.
 * @returns Base64 string.
 */
export function toBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}
