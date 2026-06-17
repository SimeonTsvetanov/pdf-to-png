import { FileArchive, RotateCcw } from "lucide-react";
import { type ReactNode } from "react";
import { Button } from "@/components/ui/button";

/** Props for {@link ActionBar}. */
export interface ActionBarProps {
  /** Number of converted pages. */
  count: number;
  /** Original file name (for context). */
  fileName: string | null;
  onDownloadAll: () => void;
  onReset: () => void;
  /** True while a ZIP is being built. */
  zipping?: boolean;
}

/**
 * Sticky results toolbar: page count, "Download all (ZIP)", and "Start over".
 */
export function ActionBar({
  count,
  fileName,
  onDownloadAll,
  onReset,
  zipping = false,
}: ActionBarProps): ReactNode {
  return (
    <div className="sticky top-[4.5rem] z-20 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-surface/90 p-4 shadow-[var(--shadow-md)] backdrop-blur-md">
      <div className="flex flex-col">
        <span className="font-display text-base font-bold">
          {count} {count === 1 ? "page" : "pages"} ready
        </span>
        {fileName && (
          <span className="max-w-[60vw] truncate text-xs text-muted-foreground">{fileName}</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw /> Start over
        </Button>
        <Button variant="gradient" size="sm" onClick={onDownloadAll} disabled={zipping}>
          <FileArchive /> {zipping ? "Zipping…" : "Download all (ZIP)"}
        </Button>
      </div>
    </div>
  );
}
