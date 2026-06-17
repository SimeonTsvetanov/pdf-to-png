import { type ReactNode } from "react";
import { Converter } from "@/components/Converter";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { InstallPrompt } from "@/components/InstallPrompt";
import { TooltipProvider } from "@/components/ui/tooltip";
import { parseServiceParams } from "@/lib/service-mode";

/**
 * Root application. Parses service-mode params once, then renders the converter.
 * In `embed=1` mode the header/footer/install banner are hidden so the app sits
 * cleanly inside an iframe.
 */
export function App(): ReactNode {
  const params = parseServiceParams(window.location.search);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex min-h-[100dvh] flex-col">
        {!params.embed && <Header />}
        <main className="mx-auto w-full max-w-[var(--content-max)] flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <Converter params={params} />
        </main>
        {!params.embed && <Footer />}
        {!params.embed && <InstallPrompt />}
      </div>
    </TooltipProvider>
  );
}
