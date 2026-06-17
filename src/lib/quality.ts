/**
 * Quality/scale helpers, kept free of any pdf.js import so they can be used by
 * UI components and unit tests without pulling in the (browser-only) renderer.
 */

/** Lowest selectable quality on the scale slider. */
export const QUALITY_MIN = 0.1;
/** Highest selectable quality (full quality) on the scale slider. */
export const QUALITY_MAX = 1.0;
/**
 * Viewport scale used when quality === QUALITY_MAX.
 * 2.0 renders pages at roughly 144 DPI for crisp, retina-grade PNGs.
 */
export const BASE_SCALE = 2.0;

/**
 * Clamp a quality value into the valid range.
 *
 * @param quality - Raw quality value.
 * @returns Quality clamped to [{@link QUALITY_MIN}, {@link QUALITY_MAX}].
 */
export function clampQuality(quality: number): number {
  if (Number.isNaN(quality)) return QUALITY_MAX;
  return Math.min(QUALITY_MAX, Math.max(QUALITY_MIN, quality));
}

/**
 * Convert a quality value (0.1–1.0) into a PDF.js viewport scale.
 *
 * @param quality - Quality value; will be clamped.
 * @returns The viewport scale to render at.
 */
export function qualityToScale(quality: number): number {
  return clampQuality(quality) * BASE_SCALE;
}
