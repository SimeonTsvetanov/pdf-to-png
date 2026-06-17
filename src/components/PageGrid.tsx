import { type ReactNode } from "react";
import { PageCard } from "@/components/PageCard";
import type { PageView } from "@/hooks/use-pdf-converter";

/** Props for {@link PageGrid}. */
export interface PageGridProps {
  pages: PageView[];
  onDownloadPage: (page: PageView) => void;
}

/** Responsive grid of rendered page tiles. */
export function PageGrid({ pages, onDownloadPage }: PageGridProps): ReactNode {
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {pages.map((page) => (
        <li key={page.pageNumber}>
          <PageCard page={page} total={pages.length} onDownload={onDownloadPage} />
        </li>
      ))}
    </ul>
  );
}
