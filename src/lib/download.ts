import JSZip from "jszip";
import type { RenderedPage } from "./pdf-to-png";
import { pageFileName } from "./utils";

/**
 * Trigger a browser download for a Blob.
 *
 * @param blob - The data to download.
 * @param fileName - The suggested file name.
 */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  // Revoke on the next tick so the download has time to start.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Bundle rendered pages into a single ZIP archive.
 *
 * @param pages - The rendered pages.
 * @param baseName - Base name (without extension) for the contained files.
 * @returns A ZIP Blob.
 */
export async function buildZip(pages: RenderedPage[], baseName: string): Promise<Blob> {
  const zip = new JSZip();
  for (const page of pages) {
    zip.file(pageFileName(baseName, page.pageNumber, pages.length), page.blob);
  }
  return zip.generateAsync({ type: "blob", compression: "DEFLATE" });
}

/**
 * Build and download a ZIP of all rendered pages.
 *
 * @param pages - The rendered pages.
 * @param baseName - Base name (without extension) for the archive and files.
 */
export async function downloadAllAsZip(pages: RenderedPage[], baseName: string): Promise<void> {
  const zip = await buildZip(pages, baseName);
  downloadBlob(zip, `${baseName}-png.zip`);
}

/**
 * Download a single rendered page as a PNG.
 *
 * @param page - The rendered page.
 * @param baseName - Base name (without extension) for the file.
 * @param totalPages - Total page count (for zero-padded numbering).
 */
export function downloadPage(page: RenderedPage, baseName: string, totalPages: number): void {
  downloadBlob(page.blob, pageFileName(baseName, page.pageNumber, totalPages));
}
