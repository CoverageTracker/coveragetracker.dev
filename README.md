# Coverage Tracker — marketing site

The marketing landing for **coveragetracker.dev**, built with **SvelteKit (Svelte 5 runes)**,
**Tailwind CSS v4**, and deployed to **Cloudflare Pages** via `@sveltejs/adapter-cloudflare`.

It mirrors the dashboard's design system: JetBrains Mono brand type, Inter body, terminal-dark
surfaces, and the six editor colorschemes (Catppuccin, Gruvbox, Nord, Solarized, Dracula,
Tokyo Night) with a live light/dark toggle. The **theme switcher from the dashboard** lives in
the nav and re-themes the entire page from a single token swap.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build      # outputs to .svelte-kit/cloudflare
npm run preview    # preview the production build locally
```

## Deploy to Cloudflare Pages

**Option A — Git integration (recommended).** Connect the repo in the Cloudflare dashboard:

- Framework preset: **SvelteKit**
- Build command: `npm run build`
- Build output directory: `.svelte-kit/cloudflare`

**Option B — Wrangler CLI.**

```bash
npm run deploy     # = vite build && wrangler pages deploy .svelte-kit/cloudflare
```

`wrangler.toml` sets `pages_build_output_dir` and `nodejs_compat`.

## Structure

```
src/
  app.html                     no-flash theme bootstrap
  app.css                      Tailwind v4 + design tokens + 6 theme scopes (×light/dark)
  lib/
    theme.svelte.ts            theme store (data-theme/data-mode, localStorage)
    components/
      Nav.svelte               sticky header + theme switcher
      Hero.svelte              wordmark, lede, coverage-ring panel, tool strip
      Features.svelte          six feature cards
      HowItWorks.svelte        three-step setup
      ThemeShowcase.svelte     live theme grid + dashboard preview
      Footer.svelte
      ThemePicker.svelte       dashboard-style scheme dropdown + mode toggle
      BrandMark.svelte
  routes/
    +layout.svelte             applies the active theme to <html>
    +layout.ts                 prerender = true
    +page.svelte               composes the landing sections
static/
  fonts/                       Inter + JetBrains Mono (woff2)
  logo-mark.svg
```

## Theming

The store writes `data-theme` and `data-mode` onto `<html>`; `app.css` maps each combination to
semantic tokens (`--bg`, `--card`, `--primary`, `--chart-0…2`, `--status-*`). Every color in a
component references a token, so a theme switch repaints the whole page — charts and badges
included. Dracula and Tokyo Night ship dark-only; their mode toggle is a no-op.

MIT licensed.
