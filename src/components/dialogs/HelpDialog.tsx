import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const STEPS: { title: string; body: string }[] = [
  {
    title: "1 · Add a PDF",
    body: "Drag a PDF onto the drop zone, or click it to browse. Everything runs locally.",
  },
  {
    title: "2 · Pick a quality",
    body: "Use the scale slider (0.1–1.0). 1.0 is full quality; lower values make smaller, faster images.",
  },
  {
    title: "3 · Download",
    body: "Each page becomes its own PNG. Download pages one by one, or grab them all as a ZIP.",
  },
];

/** "Help" dialog: a short, friendly how-to plus the service-mode hint. */
export function HelpDialog({
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
          <DialogTitle>How it works</DialogTitle>
          <DialogDescription>Convert a PDF to PNG images in three steps.</DialogDescription>
        </DialogHeader>

        <ol className="flex flex-col gap-3">
          {STEPS.map((step) => (
            <li key={step.title} className="rounded-xl bg-surface-2 p-4">
              <p className="font-display text-sm font-bold">{step.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{step.body}</p>
            </li>
          ))}
        </ol>

        <div className="rounded-xl bg-accent p-4 text-sm text-accent-foreground">
          <p className="font-semibold">Developer tip</p>
          <p className="mt-1">
            You can pre-load a PDF via URL parameters, e.g.{" "}
            <code className="font-mono text-xs">?url=…&amp;scale=0.75&amp;autodownload=zip</code>.
            Other apps can also embed this converter in an iframe and talk to it with{" "}
            <code className="font-mono text-xs">postMessage</code>.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
