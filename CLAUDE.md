# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # start dev server
pnpm build        # production build → .svelte-kit/cloudflare
pnpm preview      # preview production build locally
pnpm check        # svelte-kit sync + svelte-check (type checking)
pnpm deploy       # build + wrangler pages deploy
```

There are no tests in this repo.

## Stack

- **SvelteKit 2 + Svelte 5 runes** — write components using `$state`, `$derived`, `$effect`; no legacy stores
- **Tailwind CSS v4** (CSS-first) — configured in `app.css` via `@theme inline`, not `tailwind.config.js`
- **`@sveltejs/adapter-cloudflare`** — whole site prerendered to static HTML (`prerender = true` in `+layout.ts`)
- **Deployed to Cloudflare Pages** via the `.svelte-kit/cloudflare` output directory

## Architecture

The site is a single-page marketing landing composed of sections in `src/routes/+page.svelte`. All visual sections are standalone components under `src/lib/components/`.

### Theming system

The entire design is token-driven. `app.css` defines six editor colorschemes (Catppuccin, Gruvbox, Nord, Solarized, Dracula, Tokyo Night), each with light/dark variants, as `[data-theme][data-mode]` attribute scopes. Every color in every component uses a semantic CSS variable (`--bg`, `--card`, `--primary`, `--chart-0…2`, `--status-pass/warn/alert/fail`, etc.) — never a hardcoded color.

`src/lib/theme.svelte.ts` is a Svelte 5 `$state` store that:
- Persists selection to `localStorage` under key `ct-theme`
- Exposes `setTheme(id)`, `toggleMode()`, and `applyTheme()`
- Dracula and Tokyo Night are dark-only — `toggleMode()` is a no-op for them

`+layout.svelte` calls `applyTheme()` inside a `$effect` to keep `<html data-theme data-mode>` in sync. `app.html` contains an inline no-flash script that reads `localStorage` and sets the attributes before first paint.

### Tailwind + token integration

Design tokens are exposed to Tailwind utilities via `@theme inline` in `app.css` (e.g. `--color-bg: var(--bg)` enables `bg-bg`, `text-muted`, `border-border`). Use CSS variables directly in `<style>` blocks for component-level styling; Tailwind utilities are available in markup.

**Watch out:** Tailwind's built-in utility classes can collide with component class names. The `.ring` Tailwind utility injects `--tw-ring-shadow` — avoid using `ring` as a class name in components (use `donut`, `ring-chart`, etc.).
