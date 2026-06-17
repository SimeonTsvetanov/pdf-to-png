import { Mail, Shield, Zap } from "lucide-react";
import { Logo } from "@/components/Logo";
import { GitHubIcon } from "@/components/icons";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const GITHUB_URL = "https://github.com/simeontsvetanov/pdf-to-png";
const EMAIL = "tsvetanov.simeon@gmail.com";

/** "About" dialog: what the app is, who made it, and its privacy stance. */
export function AboutDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}): React.ReactNode {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <Logo size={56} />
          <DialogTitle>About PDF→PNG</DialogTitle>
          <DialogDescription>
            A free, open tool that converts each page of a PDF into its own PNG image — entirely in
            your browser.
          </DialogDescription>
        </DialogHeader>

        <ul className="flex flex-col gap-3 text-sm">
          <li className="flex items-start gap-3">
            <Shield className="mt-0.5 size-4 text-primary" />
            <span>
              <strong className="font-semibold">Private by design.</strong> Files never leave your
              device — there is no server and no upload.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <Zap className="mt-0.5 size-4 text-primary" />
            <span>
              <strong className="font-semibold">Works offline.</strong> Install it and convert
              anywhere, no connection needed.
            </span>
          </li>
        </ul>

        <div className="flex flex-col gap-2 rounded-xl bg-surface-2 p-4 text-sm">
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 text-foreground transition-colors hover:text-primary"
          >
            <GitHubIcon className="size-4" /> github.com/simeontsvetanov/pdf-to-png
          </a>
          <a
            href={`mailto:${EMAIL}`}
            className="flex items-center gap-2.5 text-foreground transition-colors hover:text-primary"
          >
            <Mail className="size-4" /> {EMAIL}
          </a>
        </div>

        <p className="text-xs text-muted-foreground">
          Made with care by Simeon “Moni” Tsvetanov.
        </p>
      </DialogContent>
    </Dialog>
  );
}
