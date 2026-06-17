import { describe, expect, it } from "vitest";
import {
  BASE_SCALE,
  clampQuality,
  qualityToScale,
  QUALITY_MAX,
  QUALITY_MIN,
} from "@/lib/pdf-to-png";

describe("clampQuality", () => {
  it("keeps values inside the valid range", () => {
    expect(clampQuality(0.5)).toBe(0.5);
    expect(clampQuality(2)).toBe(QUALITY_MAX);
    expect(clampQuality(-1)).toBe(QUALITY_MIN);
  });

  it("falls back to full quality for NaN", () => {
    expect(clampQuality(Number.NaN)).toBe(QUALITY_MAX);
  });
});

describe("qualityToScale", () => {
  it("maps full quality to BASE_SCALE", () => {
    expect(qualityToScale(1)).toBe(BASE_SCALE);
  });

  it("scales proportionally and clamps", () => {
    expect(qualityToScale(0.5)).toBeCloseTo(0.5 * BASE_SCALE);
    expect(qualityToScale(10)).toBe(QUALITY_MAX * BASE_SCALE);
  });
});
