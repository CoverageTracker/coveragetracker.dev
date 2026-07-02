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

### Provisioning the sync credentials

The target repo requires **signed commits** on PRs, so the workflow authenticates with a
dedicated **GitHub App** installation token rather than a PAT. This is deliberate:
`create-pull-request`'s `sign-commits` builds commits through the GitHub API, and the API
only signs them (as the app bot, shown *Verified*) when the token is a bot token — a PAT
leaves the commits **unsigned** and branch protection rejects the PR. The product GitHub
App's permissions are deliberately **not** widened for this docs plumbing, so this uses a
separate minimal App.

To (re)provision — a new fork, a rotated key, or a maintainer change:

1. **CoverageTracker** org → **Settings → Developer settings → GitHub Apps → New GitHub
   App**. Name it e.g. `coveragetracker-docs-sync`, give any valid homepage URL, and
   uncheck **Webhook → Active**.
2. Repository permissions: **Contents → Read and write**, **Pull requests → Read and
   write**; everything else: No access. Create the App.
3. App settings → **Private keys → Generate a private key** and download the `.pem`.
4. **Install** the App on the org, scoped to **Only select repositories → `coverage-tracker`**
   (installation is required — creating the App alone does nothing).
5. In **this repo** → Settings → Secrets and variables → Actions, add two secrets:
   - `DOCS_SYNC_APP_ID` — the App's numeric **App ID**
   - `DOCS_SYNC_APP_PRIVATE_KEY` — the full contents of the downloaded `.pem`

The App has no expiry to track; installation tokens are minted per run by
`actions/create-github-app-token`. If commits ever land **Unverified**, check that the App
is still installed on `coverage-tracker`.

## Theming

The store writes `data-theme` and `data-mode` onto `<html>`; `app.css` maps each combination to
semantic tokens (`--bg`, `--card`, `--primary`, `--chart-0…2`, `--status-*`). Every color in a
component references a token, so a theme switch repaints the whole page — charts and badges
included. Dracula and Tokyo Night ship dark-only; their mode toggle is a no-op.

MIT licensed.
