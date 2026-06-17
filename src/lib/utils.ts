import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge class names conditionally and resolve Tailwind conflicts.
 *
 * @param inputs - Class values (strings, arrays, conditional objects).
 * @returns A single, de-duplicated className string.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a byte count as a human-readable string (e.g. "1.2 MB").
 *
 * @param bytes - Size in bytes.
 * @param fractionDigits - Decimal places for non-byte units.
 * @returns Human-readable size string.
 */
export function formatBytes(bytes: number, fractionDigits = 1): string {
  if (bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, exponent);
  const unit = units[exponent] ?? "B";
  return `${value.toFixed(exponent === 0 ? 0 : fractionDigits)} ${unit}`;
}

/**
 * Strip the extension from a file name.
 *
 * @param fileName - The original file name, e.g. "report.pdf".
 * @returns The base name without extension, e.g. "report".
 */
export function stripExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot > 0 ? fileName.slice(0, dot) : fileName;
}

/**
 * Build a zero-padded page file name, e.g. "report-page-03.png".
 *
 * @param baseName - Base name without extension.
 * @param pageNumber - 1-based page index.
 * @param totalPages - Total number of pages (controls zero-padding width).
 * @returns The PNG file name for the page.
 */
export function pageFileName(baseName: string, pageNumber: number, totalPages: number): string {
  const width = String(totalPages).length;
  const padded = String(pageNumber).padStart(width, "0");
  return `${baseName}-page-${padded}.png`;
}
