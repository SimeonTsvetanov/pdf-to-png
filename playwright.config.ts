import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright config for optional end-to-end tests. Runs against the Vite preview
 * server. Install browsers with `npx playwright install` before `npm run test:e2e`.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:4173/pdf-to-png/",
    trace: "on-first-retry",
  },
  webServer: {
    command: "npm run build && npm run preview",
    url: "http://localhost:4173/pdf-to-png/",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
