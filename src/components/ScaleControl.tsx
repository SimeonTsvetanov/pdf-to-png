import { type ReactNode } from "react";
import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { QUALITY_MAX, QUALITY_MIN } from "@/lib/pdf-to-png";
import { cn } from "@/lib/utils";

/** Props for {@link ScaleControl}. */
export interface ScaleControlProps {
  /** Current quality value (0.1–1.0). */
  value: number;
  /** Called when the user changes the value. */
  onChange: (value: number) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * The quality/scale control: a labelled slider from 0.1 to 1.0 (full quality).
 */
export function ScaleControl({
  value,
  onChange,
  disabled = false,
  className,
}: ScaleControlProps): ReactNode {
  const percent = Math.round(value * 100);
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex items-center justify-between">
        <Tooltip>
          <TooltipTrigger asChild>
            <label className="cursor-help text-sm font-medium" htmlFor="scale-slider">
              Quality / scale
            </label>
          </TooltipTrigger>
          <TooltipContent>
            1.0 = full quality, larger files. Lower values render smaller, faster PNGs.
          </TooltipContent>
        </Tooltip>
        <span
          className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-xs tabular-nums"
          aria-live="polite"
        >
          {value.toFixed(2)} · {percent}%
        </span>
      </div>
      <Slider
        id="scale-slider"
        min={QUALITY_MIN}
        max={QUALITY_MAX}
        step={0.05}
        value={[value]}
        onValueChange={([next]) => typeof next === "number" && onChange(next)}
        disabled={disabled}
        aria-label="Quality and scale"
      />
    </div>
  );
}
