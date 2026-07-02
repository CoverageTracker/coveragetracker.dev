# Coverage Tracker — marketing site + docs

The marketing landing and documentation site for **coveragetracker.dev**, built with
**SvelteKit (Svelte 5 runes)**, **Tailwind CSS v4**, and deployed to **Cloudflare Pages**
via `@sveltejs/adapter-cloudflare`.

It mirrors the dashboard's design system: JetBrains Mono brand type, Inter body, terminal-dark
surfaces, and the six editor colorschemes (Catppuccin, Gruvbox, Nord, Solarized, Dracula,
Tokyo Night) with a live light/dark toggle. The **theme switcher from the dashboard** lives in
the nav and re-themes the entire page from a single token swap.

## Develop

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build      # outputs to .svelte-kit/cloudflare
pnpm preview    # preview the production build locally
pnpm check      # svelte-kit sync + svelte-check (type checking)
```

## Deploy to Cloudflare Pages

**Option A — Git integration (recommended).** Connect the repo in the Cloudflare dashboard:

- Framework preset: **SvelteKit**
- Build command: `pnpm build`
- Build output directory: `.svelte-kit/cloudflare`

**Option B — Wrangler CLI.**

```bash
pnpm deploy     # build + wrangler pages deploy
```

`wrangler.jsonc` sets `pages_build_output_dir` (which tells wrangler this is a Pages project, not a Worker) and `nodejs_compat`.

## Structure

```
src/
  app.html                     no-flash theme bootstrap
  app.css                      Tailwind v4 + design tokens + 6 theme scopes (×light/dark)
  lib/
    theme.svelte.ts            theme store (data-theme/data-mode, localStorage)
    components/
      Nav.svelte               sticky header, Docs link, theme switcher
      Hero.svelte              wordmark, lede, coverage-ring panel, Deploy to Cloudflare
                               button, animated typing tool strip
      Features.svelte          six feature cards
      HowItWorks.svelte        three-step setup flow
      ThemeShowcase.svelte     live theme grid + dashboard preview
      Footer.svelte            links to /#features, /docs, GitHub
      ThemePicker.svelte       dashboard-style scheme dropdown + mode toggle
      BrandMark.svelte
      docs/
        DocsSidebar.svelte     sticky left nav with scroll-spy + mobile accordion
        DocsContent.svelte     all doc sections (overview, installation, usage, reference)
        CodeBlock.svelte       code card with filename, lang badge, copy button
        Callout.svelte         note / warn callout
  routes/
    +layout.svelte             applies the active theme to <html>
    +layout.ts                 prerender = true
    +page.svelte               landing page (Hero, Features, HowItWorks, ThemeShowcase)
    docs/
      +page.svelte             /docs route (Nav, header, DocsSidebar, DocsContent, Footer)
static/
  fonts/                       Inter + JetBrains Mono (woff2)
  logo-mark.svg
```

## Docs export pipeline

This repo is the **origin of truth for shared docs content**. The `.svx` files under
`src/lib/docs-content/` are rendered into plain GitHub markdown and synced to the
[`coverage-tracker`](https://github.com/CoverageTracker/coverage-tracker) repo via PR:

- `12-generating-coverage-reports.svx` → `docs/generating-coverage-reports.md`
- the quick-start / installation / usage sections → `docs/INSTALLATION.md`

**Never edit those two files in the coverage-tracker repo** — they carry a `GENERATED`
header and any direct edit is overwritten by the next sync. Edit the `.svx` sources here
instead.

The sync runs from `.github/workflows/export-docs.yml` on every push to `main` that touches
a `.svx` file or the exporter, and opens/updates a PR on the fixed `docs-sync` branch
(re-runs update the same PR; no diff → no PR). The target list is an explicit config in
`scripts/export-docs.ts` — no globbing; adding a new synced doc is a deliberate config change.

Run it locally against a sibling checkout:

```bash
pnpm export-docs ../coverage-tracker
```

### Provisioning the sync token

The workflow authenticates with a fine-grained PAT stored as the repo secret
`COVERAGE_TRACKER_SYNC_TOKEN`. The product GitHub App's permissions are deliberately
**not** widened for this docs plumbing. To (re)provision the token — after expiry, a new
fork, or a maintainer change:

1. GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained
   tokens → Generate new token**
2. Resource owner: the **CoverageTracker** org; Repository access: **Only select
   repositories** → `coverage-tracker`
3. Repository permissions: **Contents → Read and write**, **Pull requests → Read and
   write**; everything else: No access
4. Set an expiration and note it somewhere you'll see it — when the token lapses, the
   workflow fails with an auth error on the checkout or PR step
5. Save the token in **this repo** as the Actions secret `COVERAGE_TRACKER_SYNC_TOKEN`
   (Settings → Secrets and variables → Actions)

## Theming

The store writes `data-theme` and `data-mode` onto `<html>`; `app.css` maps each combination to
semantic tokens (`--bg`, `--card`, `--primary`, `--chart-0…2`, `--status-*`). Every color in a
component references a token, so a theme switch repaints the whole page — charts and badges
included. Dracula and Tokyo Night ship dark-only; their mode toggle is a no-op.

MIT licensed.
