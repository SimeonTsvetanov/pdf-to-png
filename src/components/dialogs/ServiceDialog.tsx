import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const APP_URL = "https://simeontsvetanov.github.io/pdf-to-png/";
const API_URL = "https://pdf-to-png-service-i3sb.onrender.com";

const URL_EXAMPLE = `${APP_URL}?url=https%3A%2F%2Fexample.com%2Ffile.pdf&scale=0.75&autodownload=zip`;

const IFRAME_SNIPPET = `<iframe id="conv" src="${APP_URL}?embed=1" hidden></iframe>
<script>
  const frame = document.getElementById("conv");
  window.addEventListener("message", (e) => {
    if (e.data?.type === "pdf2png:ready") {
      frame.contentWindow.postMessage(
        { type: "pdf2png:convert", url: "https://example.com/file.pdf", scale: 0.75 },
        "*"
      );
    }
    if (e.data?.type === "pdf2png:result") {
      console.log(e.data.pages); // [{ index, dataUrl, width, height }]
    }
  });
</script>`;

const N8N_SIMPLE = `// n8n: HTTP Request node
// Method: POST
// URL:    ${API_URL}/convert?format=json&scale=1
// Body:   Binary file -> the PDF (Content-Type: application/pdf)
// Response: { count, pages: [{ index, width, height, dataUrl }] }`;

const N8N_LOOP = `// n8n Code node — convert page-by-page to avoid timeouts on big PDFs.
// One HTTP request per page keeps each call small and fast.
const API = "${API_URL}";
const pdf = $binary.data;                       // incoming binary PDF
const buf = Buffer.from(pdf.data, "base64");

// 1) how many pages?
const info = await this.helpers.httpRequest({
  method: "POST", url: API + "/info",
  body: buf, headers: { "content-type": "application/pdf" },
  json: true,
});

const out = [];
for (let i = 1; i <= info.pages; i++) {
  // 2) render one page
  const png = await this.helpers.httpRequest({
    method: "POST",
    url: \`\${API}/page?index=\${i}&scale=0.8\`,
    body: buf, headers: { "content-type": "application/pdf" },
    encoding: "arraybuffer",          // get raw bytes
    returnFullResponse: false,
  });
  out.push({
    json: { page: i },
    binary: { data: await this.helpers.prepareBinaryData(Buffer.from(png), \`page-\${i}.png\`, "image/png") },
  });
  // optional: small pause to be gentle / dodge rate limits
  await new Promise((r) => setTimeout(r, 100));
}
return out;`;

/**
 * "Use as a service" dialog — how to call the converter from other apps:
 * client-side (URL params / iframe) and via the optional hosted HTTP API,
 * with ready-to-paste n8n examples.
 */
export function ServiceDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}): React.ReactNode {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] max-w-2xl overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>Use it as a service</DialogTitle>
          <DialogDescription>
            Call the converter from other apps — in the browser, or via a hosted HTTP API.
          </DialogDescription>
        </DialogHeader>

        <Section title="1 · In the browser — URL parameters">
          <p className="text-sm text-muted-foreground">
            Open the app with parameters and it converts automatically. Great for links and simple
            embeds. Parameters: <Code>url</Code>, <Code>scale</Code> (0.1–1.0), <Code>page</Code>{" "}
            (<Code>all</Code> / <Code>3</Code> / <Code>1-4,7</Code>), <Code>autodownload</Code>{" "}
            (<Code>zip</Code>/<Code>each</Code>), <Code>embed=1</Code>.
          </p>
          <Pre>{URL_EXAMPLE}</Pre>
        </Section>

        <Section title="2 · In the browser — iframe + postMessage">
          <p className="text-sm text-muted-foreground">
            Embed the app and drive it from your page. Works fully client-side (no server).
          </p>
          <Pre>{IFRAME_SNIPPET}</Pre>
        </Section>

        <Section title="3 · Server-to-server — hosted HTTP API">
          <p className="text-sm text-muted-foreground">
            Tools like <strong>n8n</strong>, Zapier or your own backend run on a server with no
            browser, so they can’t use the modes above. For those, deploy the small included API
            (<Code>/service</Code> in the repo — Hono + MuPDF, free on a Node host like Render or
            Koyeb). Deploy it once and everyone uses the same URL. Endpoints:
          </p>
          <ul className="ml-4 list-disc text-sm text-muted-foreground">
            <li>
              <Code>POST /info</Code> → <Code>{`{ pages }`}</Code>
            </li>
            <li>
              <Code>POST /page?index=&amp;scale=</Code> → one <Code>image/png</Code>
            </li>
            <li>
              <Code>POST /convert?scale=&amp;format=zip|json&amp;page=</Code> → ZIP or JSON
            </li>
          </ul>
        </Section>

        <Section title="n8n — quick way (HTTP Request node)">
          <Pre>{N8N_SIMPLE}</Pre>
        </Section>

        <Section title="n8n — big PDFs (loop page-by-page, no timeouts)">
          <p className="text-sm text-muted-foreground">
            Ask for the page count, then render one page per request inside a loop. Small requests
            never hit execution timeouts, and you can add a short wait between pages.
          </p>
          <Pre>{N8N_LOOP}</Pre>
        </Section>

        <p className="text-xs text-muted-foreground">
          Full deploy steps and more examples are in <Code>service/README.md</Code> in the
          repository.
        </p>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }): React.ReactNode {
  return (
    <section className="flex min-w-0 flex-col gap-2 rounded-xl bg-surface-2 p-4">
      <h3 className="font-display text-sm font-bold">{title}</h3>
      {children}
    </section>
  );
}

function Code({ children }: { children: React.ReactNode }): React.ReactNode {
  return <code className="rounded bg-background/60 px-1 py-0.5 font-mono text-xs">{children}</code>;
}

function Pre({ children }: { children: string }): React.ReactNode {
  return (
    <pre className="max-w-full whitespace-pre-wrap break-words rounded-lg bg-background/70 p-3 text-xs leading-relaxed">
      <code className="font-mono">{children}</code>
    </pre>
  );
}
