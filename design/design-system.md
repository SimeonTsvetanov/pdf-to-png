# Design System — PDF→PNG

The single reference for the app's visual language. All values live as CSS custom
properties in [`tokens.css`](./tokens.css). **Components consume tokens — never
hard-code colors, spacing, radii, or shadows.**

## 1. Brand identity

- **Name / wordmark:** the two abbreviations stacked — **PDF** over **PNG** — with a
  downward double-chevron between them signaling the conversion (PDF → raster PNG).
- **Logo source files** (in [`logo/`](./logo)):
  - `logo-icon.svg` — square app icon (the badge).
  - `logo-icon-maskable.svg` — same, padded for Android maskable safe-zone.
  - `logo-full.svg` — horizontal lockup (badge + wordmark) for the header.
  - `og-image.svg` — 1200×630 social/SEO share card.
- **Generated raster set** (in [`/public`](../public)), produced from the SVGs:
  `favicon.svg`, `favicon.ico`, `favicon-16/32/48.png`, `pwa-192x192.png`,
  `pwa-512x512.png`, `pwa-maskable-192.png`, `pwa-maskable-512.png`,
  `apple-touch-icon.png` (180), `apple-touch-icon-167.png`, `apple-touch-icon-152.png`,
  `og-image.png`.
- **Regenerate icons:** the master SVGs are the source of truth. Re-run the icon
  pipeline (sharp-based) whenever the logo changes; never hand-edit the PNGs.

## 2. Color

Authored in **OKLCH** for vivid, perceptually-even color. Raw ramps
(`--violet-*`, `--cyan-*`, `--neutral-*`) feed **semantic tokens** that components
use. Two themes share the same semantic names:

| Semantic token | Light | Dark | Used for |
|----------------|-------|------|----------|
| `--background` | near-white | near-black violet-tinted | page background |
| `--foreground` | neutral-900 | neutral-100 | primary text |
| `--surface` | white | neutral-900 | cards / panels (raised by shadow) |
| `--muted` / `--muted-foreground` | light gray / mid gray | dark gray / light gray | secondary surfaces & text |
| `--primary` / `--primary-foreground` | violet-500 / white | violet-400 / near-black | primary actions |
| `--secondary` | cyan-500 | cyan-400 | secondary accents |
| `--accent` / `--accent-foreground` | violet-100 / violet-800 | violet-900 / violet-100 | subtle highlights |
| `--ring` | violet | violet | focus rings (a11y) |

- **Primary gradient:** `--brand-gradient` (violet → cyan) for the logo, hero text,
  and key CTAs.
- **Status:** `--success`, `--warning`, `--danger`.
- **Contrast:** all text/background pairs target **WCAG AA** in both themes.

## 3. Typography

- **Display / headings / logo:** **Space Grotesk** (`--font-display`).
- **Body / UI:** **Inter** (`--font-sans`).
- **Mono:** system mono (`--font-mono`) for code/URLs in docs/help.
- Shipped as **self-hosted variable fonts** (`@fontsource-variable/*`) for offline use.
- **Scale:** `--fs-xs … --fs-display` (1.250 ratio). Line-heights `--lh-tight/snug/normal`.
- Headings use `--tracking-tight`; display text slightly tighter.

## 4. The two house rules (Moni's preferences)

### No borders
UI elements have **no outlines/borders**. Separation comes from:
- **Elevation** — `--shadow-xs … --shadow-xl` on raised surfaces.
- **Background tints** — `--surface`, `--surface-2`, `--muted`.
- Use the `.u-card` utility for a standard borderless, shadow-raised card.
- *Exception:* the **focus ring** (`--ring`) is kept for keyboard accessibility.

### Hover = soft shadow lift
Interactive elements lift on hover with a soft, slightly violet drop shadow:
- Token: `--shadow-hover`; utility: `.u-lift` (adds shadow + `translateY(-2px)`).
- Honors `prefers-reduced-motion` (transform/animation disabled).

## 5. Spacing, radius, motion

- **Spacing:** 8px grid (`--space-1 … --space-8`).
- **Radius:** `--radius-sm … --radius-2xl`, `--radius-full`. Default `--radius` = md.
- **Motion:** `--dur-fast/normal/slow` with `--ease-out` / `--ease-in-out`.

## 6. Usage in code

```tsx
// Good — tokens via Tailwind v4 theme mapping or CSS vars:
<div className="u-card u-lift">
  <h2 style={{ font: "var(--fw-bold) var(--fs-xl)/1.15 var(--font-display)" }}>
    Drop a PDF
  </h2>
</div>
```

Tailwind v4 is configured to map its theme to these CSS variables, so utility
classes (`bg-background`, `text-foreground`, `bg-primary`, `rounded-lg`, …) resolve
to the tokens above. shadcn components inherit the same variables automatically.

## 7. Do / Don't

- ✅ Reference semantic tokens; ✅ use `.u-card` + `.u-lift`; ✅ keep AA contrast.
- ❌ No hex/rgb literals in components; ❌ no borders; ❌ no Google Fonts CDN at runtime.
