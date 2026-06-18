import { serve } from "@hono/node-server";
import { app } from "./app.js";

/** Node.js entry point. Run with `npm run start` (or `npm run dev`). */
const port = Number(process.env.PORT ?? 8787);
serve({ fetch: app.fetch, port }, (info) => {
  console.log(`pdf-to-png-service listening on http://localhost:${info.port}`);
});
