import { Coffee, Mail } from "lucide-react";
import { type ReactNode } from "react";
import { COFFEE_URL, GITHUB_URL } from "@/components/Header";
import { GitHubIcon } from "@/components/icons";

const EMAIL = "tsvetanov.simeon@gmail.com";

/** Footer with credits, links, and the Buy Me a Coffee call-to-action. */
export function Footer(): ReactNode {
  return (
    <footer className="mx-auto mt-auto w-full max-w-[var(--content-max)] px-4 py-10 sm:px-6">
      <div className="flex flex-col items-center gap-5 rounded-2xl bg-surface p-6 text-center shadow-[var(--shadow-sm)]">
        <a
          href={COFFEE_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-[var(--shadow-sm)] transition-[box-shadow,transform] duration-200 [background-image:var(--brand-gradient)] hover:-translate-y-0.5 hover:shadow-[var(--glow-primary)]"
        >
          <Coffee className="size-4" /> Buy me a coffee
        </a>

        <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
          >
            <GitHubIcon className="size-4" /> GitHub
          </a>
          <a
            href={`mailto:${EMAIL}`}
            className="inline-flex items-center gap-2 transition-colors hover:text-foreground"
          >
            <Mail className="size-4" /> {EMAIL}
          </a>
        </nav>

        <p className="text-xs text-muted-foreground">
          Free &amp; private · files never leave your device · © {new Date().getFullYear()} Simeon
          Tsvetanov
        </p>
      </div>
    </footer>
  );
}
