import { AlertTriangle, Loader2 } from "lucide-react";
import { useCallback, useState, type ReactNode } from "react";
import { ActionBar } from "@/components/ActionBar";
import { Dropzone } from "@/components/Dropzone";
import { PageGrid } from "@/components/PageGrid";
import { ScaleControl } from "@/components/ScaleControl";
import { usePdfConverter, type PageView } from "@/hooks/use-pdf-converter";
import { useServiceMode } from "@/hooks/use-service-mode";
import { downloadAllAsZip, downloadPage } from "@/lib/download";
import type { ServiceParams } from "@/lib/service-mode";

/** Props for {@link Converter}. */
export interface ConverterProps {
  params: ServiceParams;
}

/**
 * The main converter experience: choose a PDF, set quality, watch progress, and
 * download the resulting PNGs individually or as a ZIP.
 */
export function Converter({ params }: ConverterProps): ReactNode {
  const converter = usePdfConverter();
  const [quality, setQuality] = useState<number>(params.scale);
  const [invalid, setInvalid] = useState<string | null>(null);
  const [zipping, setZipping] = useState(false);

  useServiceMode(params, converter);

  const { status, pages, progress, error, fileName, baseName, convert, reset } = converter;
  const converting = status === "converting";

  const handleFile = useCallback(
    (file: File): void => {
      setInvalid(null);
      void convert(file, quality);
    },
    [convert, quality],
  );

  const handleDownloadAll = useCallback(async (): Promise<void> => {
    setZipping(true);
    try {
      await downloadAllAsZip(pages, baseName);
    } finally {
      setZipping(false);
    }
  }, [pages, baseName]);

  const handleDownloadPage = useCallback(
    (page: PageView): void => downloadPage(page, baseName, pages.length),
    [baseName, pages.length],
  );

  const progressPercent =
    progress.total > 0 ? Math.round((progress.done / progress.total) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      {status === "idle" && (
        <div className="flex flex-col items-center gap-3 pt-4 text-center">
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Convert <span className="u-gradient-text">PDF to PNG</span>
          </h1>
          <p className="max-w-prose text-muted-foreground">
            Turn every page of a PDF into its own PNG image — fast, free, and completely private.
            Your files never leave your device.
          </p>
        </div>
      )}

      <section className="flex flex-col gap-5 rounded-2xl bg-surface p-5 shadow-[var(--shadow-md)] sm:p-6">
        <Dropzone onFile={handleFile} onInvalid={setInvalid} disabled={converting} />
        <ScaleControl value={quality} onChange={setQuality} disabled={converting} />
      </section>

      {invalid && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-xl bg-surface p-4 text-sm text-danger shadow-[var(--shadow-sm)]"
        >
          <AlertTriangle className="size-4 shrink-0" /> {invalid}
        </p>
      )}

      {converting && (
        <div
          className="flex flex-col gap-3 rounded-2xl bg-surface p-5 shadow-[var(--shadow-md)]"
          aria-live="polite"
        >
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 font-medium">
              <Loader2 className="size-4 animate-spin text-primary" /> Converting…
            </span>
            <span className="font-mono text-xs text-muted-foreground">
              {progress.done}/{progress.total || "?"}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full transition-[width] duration-300 [background-image:var(--brand-gradient)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {status === "error" && error && (
        <p
          role="alert"
          className="flex items-center gap-2 rounded-xl bg-surface p-4 text-sm text-danger shadow-[var(--shadow-sm)]"
        >
          <AlertTriangle className="size-4 shrink-0" /> {error}
        </p>
      )}

      {status === "done" && pages.length > 0 && (
        <div className="flex flex-col gap-5">
          <ActionBar
            count={pages.length}
            fileName={fileName}
            onDownloadAll={() => void handleDownloadAll()}
            onReset={reset}
            zipping={zipping}
          />
          <PageGrid pages={pages} onDownloadPage={handleDownloadPage} />
        </div>
      )}
    </div>
  );
}
