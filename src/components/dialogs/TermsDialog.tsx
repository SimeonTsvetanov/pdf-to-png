import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** "Terms & Conditions" dialog — intentionally simple. */
export function TermsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}): React.ReactNode {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Terms &amp; Conditions</DialogTitle>
          <DialogDescription>The short version, because this tool is free.</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            PDF→PNG is provided free of charge, “as is”, without warranty of any kind. You use it at
            your own risk.
          </p>
          <p>
            All conversion happens locally in your browser. Your files are never uploaded and never
            leave your device. The author does not collect, store, or transmit your documents.
          </p>
          <p>
            To the maximum extent permitted by law, the author accepts no liability for any loss or
            damage arising from the use of this tool, including any results produced by it.
          </p>
          <p>
            When using the optional URL/embed “service” mode with remote files, you are responsible
            for ensuring you have the right to access and convert those files.
          </p>
          <p className="text-foreground">
            If you do not agree with these terms, please do not use the app.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
