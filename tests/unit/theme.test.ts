import { describe, expect, it } from "vitest";
import { normalizeTheme, resolveTheme } from "@/lib/theme";

describe("resolveTheme", () => {
  it("returns the explicit choice for light/dark", () => {
    expect(resolveTheme("light", true)).toBe("light");
    expect(resolveTheme("dark", false)).toBe("dark");
  });

  it("follows the system preference for 'system'", () => {
    expect(resolveTheme("system", true)).toBe("dark");
    expect(resolveTheme("system", false)).toBe("light");
  });
});

describe("normalizeTheme", () => {
  it("accepts valid themes", () => {
    expect(normalizeTheme("light")).toBe("light");
    expect(normalizeTheme("dark")).toBe("dark");
    expect(normalizeTheme("system")).toBe("system");
  });

  it("defaults invalid values to 'system'", () => {
    expect(normalizeTheme(null)).toBe("system");
    expect(normalizeTheme("purple")).toBe("system");
    expect(normalizeTheme(42)).toBe("system");
  });
});
