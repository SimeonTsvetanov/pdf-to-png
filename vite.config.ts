/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath, URL } from "node:url";

/**
 * Vite configuration.
 *
 * `base` MUST match the GitHub Pages repository name so that every asset URL
 * (JS, CSS, the PDF.js worker, manifest and icons) resolves correctly when the
 * app is served from `https://<user>.github.io/pdf-to-png/`.
 */
const BASE = "/pdf-to-png/";

export default defineConfig({
  base: BASE,
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: [
        "favicon.svg",
        "favicon.ico",
        "apple-touch-icon.png",
        "apple-touch-icon-167.png",
        "apple-touch-icon-152.png",
        "robots.txt",
        "og-image.png",
      ],
      manifest: {
        id: BASE,
        name: "PDF to PNG — Convert & Download",
        short_name: "PDF→PNG",
        description:
          "Convert PDF pages to PNG images, right in your browser. Free, private, offline.",
        start_url: BASE,
        scope: BASE,
        display: "standalone",
        background_color: "#0b0b12",
        theme_color: "#7c3aed",
        orientation: "any",
        categories: ["utilities", "productivity"],
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "pwa-maskable-192.png", sizes: "192x192", type: "image/png", purpose: "maskable" },
          { src: "pwa-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,woff2}"],
        cleanupOutdatedCaches: true,
        clientsClaim: true,
      },
      devOptions: { enabled: false },
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["tests/e2e/**", "node_modules/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/lib/**", "src/hooks/**"],
    },
  },
});
