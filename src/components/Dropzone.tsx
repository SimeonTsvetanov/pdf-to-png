import { FileUp } from "lucide-react";
import { useCallback, useRef, useState, type DragEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Props for {@link Dropzone}. */
export interface DropzoneProps {
  /** Called with a valid PDF file. */
  onFile: (file: File) => void;
  /** Called when a non-PDF file is provided. */
  onInvalid?: (message: string) => void;
  /** Disable interaction (e.g. while converting). */
  disabled?: boolean;
}

function isPdf(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

/**
 * A borderless drag-and-drop zone (with click-to-browse) for selecting a PDF.
 * Separation and the drag-over state are shown with background tint + shadow,
 * never an outline.
 */
export function Dropzone({ onFile, onInvalid, disabled = false }: DropzoneProps): ReactNode {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = useCallback(
    (files: FileList | null): void => {
      const file = files?.[0];
      if (!file) return;
      if (isPdf(file)) onFile(file);
      else onInvalid?.("That doesn't look like a PDF. Please choose a .pdf file.");
    },
    [onFile, onInvalid],
  );

  const onDrop = useCallback(
    (event: DragEvent<HTMLButtonElement>): void => {
      event.preventDefault();
      setIsDragging(false);
      if (!disabled) handleFiles(event.dataTransfer.files);
    },
    [disabled, handleFiles],
  );

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        aria-label="Drop a PDF here or click to browse"
        className={cn(
          "group grid w-full place-items-center gap-4 rounded-2xl bg-surface px-6 py-16 text-center",
          "shadow-[var(--shadow-md)] transition-[box-shadow,transform,background-color] duration-200",
          "hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)]",
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ring)]",
          "disabled:cursor-not-allowed disabled:opacity-60",
          isDragging && "-translate-y-0.5 bg-accent shadow-[var(--shadow-hover)]",
        )}
      >
        <span
          className={cn(
            "grid size-16 place-items-center rounded-2xl text-white shadow-[var(--shadow-md)] transition-transform",
            "[background-image:var(--brand-gradient)] group-hover:scale-105",
          )}
        >
          <FileUp className="size-7" />
        </span>
        <span className="flex flex-col gap-1">
          <span className="font-display text-lg font-bold">
            Drop a PDF here, or click to browse
          </span>
          <span className="text-sm text-muted-foreground">
            Each page becomes its own PNG · files stay on your device
          </span>
        </span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,.pdf"
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </>
  );
}
