import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { buildZip } from "@/lib/download";
import type { RenderedPage } from "@/lib/pdf-to-png";

function makePage(pageNumber: number): RenderedPage {
  return {
    pageNumber,
    blob: new Blob([`png-bytes-${pageNumber}`], { type: "image/png" }),
    width: 100,
    height: 140,
  };
}

describe("buildZip", () => {
  it("creates a non-empty ZIP containing one entry per page", async () => {
    const pages = [makePage(1), makePage(2), makePage(3)];
    const zipBlob = await buildZip(pages, "report");

    expect(zipBlob).toBeInstanceOf(Blob);
    expect(zipBlob.size).toBeGreaterThan(0);

    const reloaded = await JSZip.loadAsync(await zipBlob.arrayBuffer());
    const names = Object.keys(reloaded.files).sort();
    expect(names).toEqual(["report-page-1.png", "report-page-2.png", "report-page-3.png"]);
  });
});
