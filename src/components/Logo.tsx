import { useId } from "react";
import { cn } from "@/lib/utils";

/** Props for {@link Logo}. */
export interface LogoProps {
  /** Pixel size of the square badge. */
  size?: number;
  /** Show the "PDF→PNG" wordmark next to the badge. */
  withWordmark?: boolean;
  className?: string;
}

/**
 * The brand mark: a violet→cyan badge with the stacked "PDF / PNG" wordmark and
 * a downward double-chevron signalling the conversion. Rendered inline as SVG so
 * it stays crisp at any size and inherits theme colors for the wordmark.
 */
export function Logo({ size = 40, withWordmark = false, className }: LogoProps): React.ReactNode {
  const id = useId();
  const grad = `brand-${id}`;
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 512 512"
        role="img"
        aria-label="PDF to PNG"
        className="shrink-0"
      >
        <defs>
          <linearGradient id={grad} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#7c3aed" />
            <stop offset="0.55" stopColor="#6d3df0" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        <rect x="24" y="24" width="464" height="464" rx="116" fill={`url(#${grad})`} />
        <g
          fontFamily="var(--font-display)"
          fontWeight={700}
          textAnchor="middle"
          fill="#ffffff"
        >
          <text x="256" y="205" fontSize="134" letterSpacing="2">
            PDF
          </text>
          <text x="256" y="448" fontSize="134" letterSpacing="2">
            PNG
          </text>
        </g>
        <g transform="translate(256 252)" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d="M-32 -24 L0 0 L32 -24" stroke="#ffffff" strokeWidth="13" opacity="0.95" />
          <path d="M-32 4 L0 28 L32 4" stroke="#a5f3fc" strokeWidth="13" opacity="0.92" />
        </g>
      </svg>
      {withWordmark && (
        <span className="font-display text-lg font-bold leading-none tracking-tight">
          PDF<span className="text-muted-foreground">→</span>PNG
        </span>
      )}
    </span>
  );
}
