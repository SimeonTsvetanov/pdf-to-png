import { describe, expect, it } from "vitest";
import { cn, formatBytes, pageFileName, stripExtension } from "@/lib/utils";

describe("cn", () => {
  it("merges class names and resolves Tailwind conflicts", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    const hidden = false as boolean;
    expect(cn("text-sm", hidden && "hidden", "font-bold")).toBe("text-sm font-bold");
  });
});

describe("formatBytes", () => {
  it("formats common sizes", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(512)).toBe("512 B");
    expect(formatBytes(1024)).toBe("1.0 KB");
    expect(formatBytes(1024 * 1024)).toBe("1.0 MB");
  });
});

describe("stripExtension", () => {
  it("removes the trailing extension", () => {
    expect(stripExtension("report.pdf")).toBe("report");
    expect(stripExtension("a.b.pdf")).toBe("a.b");
    expect(stripExtension("noext")).toBe("noext");
  });
});

describe("pageFileName", () => {
  it("zero-pads page numbers to the width of the total", () => {
    expect(pageFileName("doc", 3, 12)).toBe("doc-page-03.png");
    expect(pageFileName("doc", 3, 9)).toBe("doc-page-3.png");
    expect(pageFileName("doc", 7, 100)).toBe("doc-page-007.png");
  });
});
