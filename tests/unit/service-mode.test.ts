import { describe, expect, it } from "vitest";
import {
  pageIncluded,
  parsePageSpec,
  parseServiceParams,
  SERVICE_MESSAGES,
} from "@/lib/service-mode";

describe("parsePageSpec", () => {
  it("defaults to all pages", () => {
    expect(parsePageSpec(null)).toEqual({ kind: "all" });
    expect(parsePageSpec("all")).toEqual({ kind: "all" });
    expect(parsePageSpec("  ALL ")).toEqual({ kind: "all" });
  });

  it("parses single pages and ranges, sorted and de-duplicated", () => {
    expect(parsePageSpec("3")).toEqual({ kind: "list", list: [3] });
    expect(parsePageSpec("1-3")).toEqual({ kind: "list", list: [1, 2, 3] });
    expect(parsePageSpec("3,1,2,2")).toEqual({ kind: "list", list: [1, 2, 3] });
    expect(parsePageSpec("4-2")).toEqual({ kind: "list", list: [2, 3, 4] });
  });

  it("ignores invalid tokens", () => {
    expect(parsePageSpec("abc")).toEqual({ kind: "all" });
    expect(parsePageSpec("0,-1")).toEqual({ kind: "all" });
  });
});

describe("parseServiceParams", () => {
  it("applies sensible defaults", () => {
    const params = parseServiceParams("");
    expect(params.url).toBeNull();
    expect(params.scale).toBe(1.0);
    expect(params.pages).toEqual({ kind: "all" });
    expect(params.autodownload).toBe("off");
    expect(params.embed).toBe(false);
    expect(params.format).toBe("png");
  });

  it("parses and clamps the scale", () => {
    expect(parseServiceParams("?scale=0.5").scale).toBe(0.5);
    expect(parseServiceParams("?scale=5").scale).toBe(1.0);
    expect(parseServiceParams("?scale=0").scale).toBe(0.1);
  });

  it("reads url, autodownload and embed", () => {
    const params = parseServiceParams(
      "?url=https%3A%2F%2Fx.com%2Ff.pdf&autodownload=zip&embed=1",
    );
    expect(params.url).toBe("https://x.com/f.pdf");
    expect(params.autodownload).toBe("zip");
    expect(params.embed).toBe(true);
  });

  it("falls back to off for unknown autodownload values", () => {
    expect(parseServiceParams("?autodownload=nope").autodownload).toBe("off");
  });
});

describe("pageIncluded", () => {
  it("includes everything for an 'all' spec", () => {
    expect(pageIncluded({ kind: "all" }, 99)).toBe(true);
  });
  it("respects an explicit list", () => {
    const spec = parsePageSpec("2,4");
    expect(pageIncluded(spec, 2)).toBe(true);
    expect(pageIncluded(spec, 3)).toBe(false);
  });
});

describe("SERVICE_MESSAGES", () => {
  it("exposes the documented message names", () => {
    expect(SERVICE_MESSAGES.ready).toBe("pdf2png:ready");
    expect(SERVICE_MESSAGES.convert).toBe("pdf2png:convert");
    expect(SERVICE_MESSAGES.result).toBe("pdf2png:result");
  });
});
