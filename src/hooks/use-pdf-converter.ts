import { useCallback, useRef, useState } from "react";
import { convertPdfToPngs, type RenderedPage } from "@/lib/pdf-to-png";
import { stripExtension } from "@/lib/utils";

/** A rendered page plus an object URL for previewing it. */
export interface PageView extends RenderedPage {
  /** Object URL for an <img> preview. */
  readonly url: string;
}

/** Converter lifecycle status. */
export type ConverterStatus = "idle" | "converting" | "done" | "error";

/** Public state and actions returned by {@link usePdfConverter}. */
export interface PdfConverterState {
  status: ConverterStatus;
  fileName: string | null;
  baseName: string;
  pages: PageView[];
  progress: { done: number; total: number };
  error: string | null;
  /** Convert a PDF File at the given quality (0.1–1.0). */
  convert: (file: File, quality: number) => Promise<void>;
  /** Clear all results and revoke preview URLs. */
  reset: () => void;
}

/**
 * Stateful PDF→PNG converter for the UI: tracks progress, builds previews,
 * and cleans up object URLs.
 *
 * @returns Converter state and actions.
 */
export function usePdfConverter(): PdfConverterState {
  const [status, setStatus] = useState<ConverterStatus>("idle");
  const [fileName, setFileName] = useState<string | null>(null);
  const [pages, setPages] = useState<PageView[]>([]);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);
  const urlsRef = useRef<string[]>([]);

  const revokeUrls = useCallback((): void => {
    for (const url of urlsRef.current) URL.revokeObjectURL(url);
    urlsRef.current = [];
  }, []);

  const reset = useCallback((): void => {
    revokeUrls();
    setStatus("idle");
    setFileName(null);
    setPages([]);
    setProgress({ done: 0, total: 0 });
    setError(null);
  }, [revokeUrls]);

  const convert = useCallback(
    async (file: File, quality: number): Promise<void> => {
      revokeUrls();
      setStatus("converting");
      setFileName(file.name);
      setPages([]);
      setError(null);
      setProgress({ done: 0, total: 0 });

      try {
        const data = await file.arrayBuffer();
        const rendered = await convertPdfToPngs(data, {
          quality,
          onProgress: (done, total) => setProgress({ done, total }),
        });
        const views: PageView[] = rendered.map((page) => {
          const url = URL.createObjectURL(page.blob);
          urlsRef.current.push(url);
          return { ...page, url };
        });
        setPages(views);
        setStatus("done");
      } catch (cause) {
        const message =
          cause instanceof Error ? cause.message : "Could not convert this PDF. Please try another file.";
        setError(message);
        setStatus("error");
      }
    },
    [revokeUrls],
  );

  return {
    status,
    fileName,
    baseName: fileName ? stripExtension(fileName) : "pages",
    pages,
    progress,
    error,
    convert,
    reset,
  };
}
