import type { PDFPageProxy } from "pdfjs-dist";
// Vite resolves this to a hashed, base-path-aware URL for the PDF.js worker.
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { qualityToScale, QUALITY_MAX } from "./quality";

export { QUALITY_MIN, QUALITY_MAX, BASE_SCALE, clampQuality, qualityToScale } from "./quality";

/**
 * Lazily import pdf.js so the (large) renderer is split into its own chunk and
 * only downloaded when the user actually converts a file. The worker source is
 * configured once, on first use.
 */
let pdfjsPromise: Promise<typeof import("pdfjs-dist")> | null = null;
async function getPdfjs(): Promise<typeof import("pdfjs-dist")> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((lib) => {
      lib.GlobalWorkerOptions.workerSrc = workerUrl;
      return lib;
    });
  }
  return pdfjsPromise;
}

/** A single rendered page, ready to download. */
export interface RenderedPage {
  /** 1-based page number. */
  readonly pageNumber: number;
  /** PNG image data. */
  readonly blob: Blob;
  /** Output width in pixels. */
  readonly width: number;
  /** Output height in pixels. */
  readonly height: number;
}

/** Options for {@link convertPdfToPngs}. */
export interface ConvertOptions {
  /** Quality from 0.1 to 1.0. Defaults to full quality. */
  readonly quality?: number;
  /** Abort signal to cancel an in-flight conversion. */
  readonly signal?: AbortSignal;
  /** Called after each page renders, for progress UI. */
  readonly onProgress?: (done: number, total: number) => void;
}

/**
 * Read the number of pages in a PDF without rendering it.
 *
 * @param data - The PDF file as an ArrayBuffer.
 * @returns The page count.
 */
export async function getPdfPageCount(data: ArrayBuffer): Promise<number> {
  const pdfjsLib = await getPdfjs();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(data) });
  const doc = await loadingTask.promise;
  const count = doc.numPages;
  await loadingTask.destroy();
  return count;
}

/**
 * Render a single PDF page to a PNG blob.
 *
 * @param page - A PDF.js page proxy.
 * @param scale - Viewport scale.
 * @returns The rendered page metadata and PNG blob.
 */
async function renderPageToPng(
  page: PDFPageProxy,
  scale: number,
): Promise<{ blob: Blob; width: number; height: number }> {
  const viewport = page.getViewport({ scale });
  const width = Math.floor(viewport.width);
  const height = Math.floor(viewport.height);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Unable to get a 2D canvas context for rendering.");
  }

  await page.render({ canvas, canvasContext: context, viewport }).promise;

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((result) => {
      if (result) resolve(result);
      else reject(new Error("Failed to encode page as PNG."));
    }, "image/png");
  });

  // Release canvas memory eagerly.
  canvas.width = 0;
  canvas.height = 0;

  return { blob, width, height };
}

/**
 * Convert every page of a PDF into its own PNG image, entirely in the browser.
 *
 * @param data - The PDF file as an ArrayBuffer.
 * @param options - Quality, progress, and cancellation options.
 * @returns One {@link RenderedPage} per page, in page order.
 * @throws If the conversion is aborted or a page fails to render.
 */
export async function convertPdfToPngs(
  data: ArrayBuffer,
  options: ConvertOptions = {},
): Promise<RenderedPage[]> {
  const { quality = QUALITY_MAX, signal, onProgress } = options;
  const scale = qualityToScale(quality);

  const pdfjsLib = await getPdfjs();
  const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(data) });
  const doc = await loadingTask.promise;
  const total = doc.numPages;
  const pages: RenderedPage[] = [];

  try {
    for (let pageNumber = 1; pageNumber <= total; pageNumber += 1) {
      if (signal?.aborted) {
        throw new DOMException("Conversion aborted.", "AbortError");
      }
      const page = await doc.getPage(pageNumber);
      const { blob, width, height } = await renderPageToPng(page, scale);
      page.cleanup();
      pages.push({ pageNumber, blob, width, height });
      onProgress?.(pageNumber, total);
    }
  } finally {
    await loadingTask.destroy();
  }

  return pages;
}
