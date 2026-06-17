import { Download } from "lucide-react";
import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import type { PageView } from "@/hooks/use-pdf-converter";
import { formatBytes } from "@/lib/utils";

/** Props for {@link PageCard}. */
export interface PageCardProps {
  page: PageView;
  /** Total page count (for download numbering). */
  total: number;
  /** Download this single page. */
  onDownload: (page: PageView) => void;
}

/**
 * A single result tile: page preview, dimensions/size, and a download button.
 * Borderless; lifts on hover.
 */
export function PageCard({ page, onDownload }: PageCardProps): ReactNode {
  return (
    <figure className="group flex flex-col overflow-hidden rounded-xl bg-surface shadow-[var(--shadow-md)] transition-[box-shadow,transform] duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-hover)]">
      <div className="grid aspect-[3/4] place-items-center overflow-hidden bg-surface-2 p-3">
        <img
          src={page.url}
          alt={`Page ${page.pageNumber}`}
          loading="lazy"
          className="max-h-full max-w-full rounded-md object-contain shadow-[var(--shadow-sm)]"
        />
      </div>
      <figcaption className="flex items-center justify-between gap-2 p-3">
        <span className="flex flex-col">
          <span className="text-sm font-semibold">Page {page.pageNumber}</span>
          <span className="font-mono text-xs text-muted-foreground">
            {page.width}×{page.height} · {formatBytes(page.blob.size)}
          </span>
        </span>
        <Button
          variant="secondary"
          size="icon"
          aria-label={`Download page ${page.pageNumber}`}
          onClick={() => onDownload(page)}
        >
          <Download />
        </Button>
      </figcaption>
    </figure>
  );
}
