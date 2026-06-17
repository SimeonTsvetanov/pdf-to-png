import { useEffect, useRef } from "react";
import { downloadAllAsZip, downloadPage } from "@/lib/download";
import { SERVICE_MESSAGES, type ServiceParams } from "@/lib/service-mode";
import type { PdfConverterState } from "@/hooks/use-pdf-converter";

/** Convert a Blob to a base64 data URL. */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("Failed to read blob."));
    reader.readAsDataURL(blob);
  });
}

/** Decode a base64 string into a PDF File. */
function base64ToFile(base64: string, name = "input.pdf"): File {
  const clean = base64.includes(",") ? base64.slice(base64.indexOf(",") + 1) : base64;
  const binary = atob(clean);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new File([bytes], name, { type: "application/pdf" });
}

function inIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

interface ConvertMessage {
  type: typeof SERVICE_MESSAGES.convert;
  url?: string;
  fileBase64?: string;
  scale?: number;
}

function isConvertMessage(data: unknown): data is ConvertMessage {
  return (
    typeof data === "object" &&
    data !== null &&
    (data as { type?: unknown }).type === SERVICE_MESSAGES.convert
  );
}

/**
 * Wire up the client-side "service" mode: convert a PDF passed via URL params or
 * an iframe `postMessage`, auto-download if requested, and reply to the host.
 *
 * @param params - Parsed service-mode parameters.
 * @param converter - The shared converter state/actions.
 */
export function useServiceMode(params: ServiceParams, converter: PdfConverterState): void {
  const { convert, status, pages, error, baseName } = converter;
  const lastHandled = useRef<string>("");

  // Announce readiness to a host page and auto-run a URL job on first load.
  useEffect(() => {
    if (inIframe()) {
      window.parent.postMessage({ type: SERVICE_MESSAGES.ready }, "*");
    }
    if (params.url) {
      void (async () => {
        try {
          const response = await fetch(params.url as string);
          if (!response.ok) throw new Error(`Failed to fetch PDF (${response.status}).`);
          const blob = await response.blob();
          const file = new File([blob], "remote.pdf", { type: "application/pdf" });
          await convert(file, params.scale);
        } catch (cause) {
          const message = cause instanceof Error ? cause.message : "Failed to load remote PDF.";
          if (inIframe()) {
            window.parent.postMessage({ type: SERVICE_MESSAGES.error, message }, "*");
          }
        }
      })();
    }
    // Run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for host-driven conversion requests.
  useEffect(() => {
    const onMessage = (event: MessageEvent): void => {
      if (!isConvertMessage(event.data)) return;
      const { url, fileBase64, scale } = event.data;
      const quality = typeof scale === "number" ? scale : params.scale;
      void (async () => {
        try {
          let file: File;
          if (fileBase64) {
            file = base64ToFile(fileBase64);
          } else if (url) {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch PDF (${response.status}).`);
            file = new File([await response.blob()], "remote.pdf", { type: "application/pdf" });
          } else {
            return;
          }
          await convert(file, quality);
        } catch (cause) {
          const message = cause instanceof Error ? cause.message : "Conversion failed.";
          window.parent.postMessage({ type: SERVICE_MESSAGES.error, message }, "*");
        }
      })();
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [convert, params.scale]);

  // React to completed conversions: auto-download and reply to the host.
  useEffect(() => {
    if (status !== "done" || pages.length === 0) return;
    const signature = `${baseName}:${pages.length}`;
    if (lastHandled.current === signature) return;
    lastHandled.current = signature;

    if (params.autodownload === "zip") {
      void downloadAllAsZip(pages, baseName);
    } else if (params.autodownload === "each") {
      for (const page of pages) downloadPage(page, baseName, pages.length);
    }

    if (inIframe()) {
      void (async () => {
        const payload = await Promise.all(
          pages.map(async (page) => ({
            index: page.pageNumber,
            width: page.width,
            height: page.height,
            dataUrl: await blobToDataUrl(page.blob),
          })),
        );
        window.parent.postMessage(
          { type: SERVICE_MESSAGES.result, pages: payload },
          "*",
        );
      })();
    }
  }, [status, pages, baseName, params.autodownload]);

  // Forward errors to the host.
  useEffect(() => {
    if (status === "error" && error && inIframe()) {
      window.parent.postMessage({ type: SERVICE_MESSAGES.error, message: error }, "*");
    }
  }, [status, error]);
}
