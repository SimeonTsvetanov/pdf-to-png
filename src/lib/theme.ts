/** The theme preferences a user can choose. */
export type Theme = "light" | "dark" | "system";

/** The concrete theme actually applied to the DOM. */
export type ResolvedTheme = "light" | "dark";

/** localStorage key for the persisted theme preference. */
export const THEME_STORAGE_KEY = "pdf2png:theme";

/**
 * Resolve a theme preference into a concrete light/dark value.
 *
 * @param theme - The user preference.
 * @param systemPrefersDark - Whether the OS currently prefers dark mode.
 * @returns The concrete theme to apply.
 */
export function resolveTheme(theme: Theme, systemPrefersDark: boolean): ResolvedTheme {
  if (theme === "system") return systemPrefersDark ? "dark" : "light";
  return theme;
}

/**
 * Validate an unknown value as a {@link Theme}.
 *
 * @param value - Possibly a stored theme string.
 * @returns A valid theme, defaulting to "system".
 */
export function normalizeTheme(value: unknown): Theme {
  return value === "light" || value === "dark" || value === "system" ? value : "system";
}
