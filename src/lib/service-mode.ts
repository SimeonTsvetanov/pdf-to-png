import { clampQuality, QUALITY_MAX } from "./pdf-to-png";

/**
 * Client-side "service" mode.
 *
 * GitHub Pages is static, so this app exposes a converter that other platforms
 * can drive via URL parameters and/or an embedded iframe using `postMessage`.
 * See `reports/04-microservice-client-side.md` for the full contract.
 */

/** Auto-download behavior requested via the `autodownload` param. */
export type AutoDownload = "zip" | "each" | "off";

/** Which pages to output. */
export type PageSpec = { readonly kind: "all" } | { readonly kind: "list"; readonly list: number[] };

/** Parsed service-mode parameters. */
export interface ServiceParams {
  /** Remote PDF URL to fetch and convert (CORS permitting). */
  readonly url: string | null;
  /** Render quality (0.1–1.0). */
  readonly scale: number;
  /** Pages to output. */
  readonly pages: PageSpec;
  /** Output format (PNG only, for now). */
  readonly format: "png";
  /** Auto-download behavior. */
  readonly autodownload: AutoDownload;
  /** Whether to render in embed mode (chrome hidden for clean iframing). */
  readonly embed: boolean;
}

/** postMessage event type names exchanged with a host page. */
export const SERVICE_MESSAGES = {
  ready: "pdf2png:ready",
  convert: "pdf2png:convert",
  progress: "pdf2png:progress",
  result: "pdf2png:result",
  error: "pdf2png:error",
} as const;

/**
 * Parse a `page` parameter such as "all", "3", or "1-4,7" into a {@link PageSpec}.
 *
 * @param raw - The raw parameter value (or null).
 * @returns A normalized page spec.
 */
export function parsePageSpec(raw: string | null): PageSpec {
  if (!raw || raw.trim().toLowerCase() === "all") return { kind: "all" };
  const list = new Set<number>();
  for (const part of raw.split(",")) {
    const segment = part.trim();
    if (!segment) continue;
    const range = segment.match(/^(\d+)\s*-\s*(\d+)$/);
    if (range) {
      const start = Number(range[1]);
      const end = Number(range[2]);
      for (let n = Math.min(start, end); n <= Math.max(start, end); n += 1) {
        if (n >= 1) list.add(n);
      }
    } else if (/^\d+$/.test(segment)) {
      const n = Number(segment);
      if (n >= 1) list.add(n);
    }
  }
  const sorted = [...list].sort((a, b) => a - b);
  return sorted.length > 0 ? { kind: "list", list: sorted } : { kind: "all" };
}

/**
 * Parse the current location's query string into {@link ServiceParams}.
 *
 * @param search - A query string (e.g. `window.location.search`).
 * @returns The parsed parameters with sensible defaults.
 */
export function parseServiceParams(search: string): ServiceParams {
  const params = new URLSearchParams(search);

  const rawScale = params.get("scale");
  const scale = rawScale === null ? QUALITY_MAX : clampQuality(Number(rawScale));

  const autodownloadRaw = (params.get("autodownload") ?? "off").toLowerCase();
  const autodownload: AutoDownload =
    autodownloadRaw === "zip" || autodownloadRaw === "each" ? autodownloadRaw : "off";

  return {
    url: params.get("url"),
    scale,
    pages: parsePageSpec(params.get("page")),
    format: "png",
    autodownload,
    embed: params.get("embed") === "1" || params.get("embed") === "true",
  };
}

/**
 * Decide whether a {@link PageSpec} includes a given page number.
 *
 * @param spec - The page spec.
 * @param pageNumber - 1-based page number.
 * @returns True if the page should be output.
 */
export function pageIncluded(spec: PageSpec, pageNumber: number): boolean {
  return spec.kind === "all" || spec.list.includes(pageNumber);
}
