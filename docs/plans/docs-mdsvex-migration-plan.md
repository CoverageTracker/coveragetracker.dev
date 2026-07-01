# Docs Site → mdsvex Migration Plan

Migrate `src/lib/components/docs/DocsContent.svelte` — currently ~15 hardcoded
sections of markup, JS data arrays, and template strings — to mdsvex, so each
doc section becomes a standalone `.svx` file with markdown prose, frontmatter
for structured data, and the existing `Callout` / `CodeBlock` / `deftable` /
`steplist` components invoked directly. `DocsSidebar.svelte`'s scroll-spy
behavior (keyed on `<section id="...">`) and all current visual output must
be preserved exactly.

## Background

A proof-of-concept was built and run end-to-end (not just sketched) against
the `github-app` section to settle two open questions before committing to
this approach:

1. **Frontmatter → component data.** Does `id` / `kicker` / `title` in
   frontmatter cleanly reach the rendered page? — confirmed yes, via
   `mdsvex`'s `compile()` API (`result.data.fm`) and its auto-injected
   `export const metadata = {...}` module export.
2. **GFM alert blockquotes → real `<Callout>` component tags**, not just
   styled HTML. — confirmed yes, via a custom remark plugin using
   `node.data.hName` / `hProperties`, **after** discovering and fixing a real
   bug: `[!WARNING]` parses as a CommonMark `linkReference` node (square
   brackets are link syntax), not as plain text — naive regex-on-text-node
   matching silently no-ops. The fixed plugin and a 9-assertion smoke test
   both pass. Full code is in the Appendix below.

This plan extends that validated approach to the rest of the site.

## Scope

**In scope:** migrating all 15 sections currently in `DocsContent.svelte` to
`.svx` files, plus the supporting mdsvex config, shared layout, and remark
plugins needed to render them identically to today's output.

**Explicit non-goals for this pass** (called out so they're decided on
purpose, not by accident):
- `DocsSidebar.svelte`'s `groups` array (the "Getting started / Installation
  / Usage / Reference" taxonomy) stays hardcoded. It's a navigation
  structure, not document content, and deriving it dynamically from
  frontmatter is a separate refactor with its own tradeoffs.
- `CodeBlock.svelte`'s internal syntax-highlighting implementation is
  unchanged — this plan only changes how it gets *invoked*.
- No visual/CSS changes. Output must be pixel-equivalent to current.

---

## Phase 0 — Proof of concept ✅ Complete

- [x] `remark-callouts.ts` — remark plugin, GFM alert blockquotes → `<Callout>`
- [x] `github-app.svx` — fixture frontmatter + one real alert from the actual
      `github-app` section content
- [x] `smoke-test.ts` — 9 assertions across 2 cases (inline title, fallback
      title), run via `npx tsx`, all passing
- [x] Confirmed `hName`/`hProperties` survives mdsvex's pipeline as a literal
      capitalized Svelte component tag (not lowercased/escaped)
- [x] Found and fixed the `linkReference`-vs-text-node parsing bug

See **Appendix** for full code.

---

## Phase 1 — mdsvex infrastructure

- [ ] `npm install mdsvex unist-util-visit`
- [ ] `npm install -D @types/mdast` (types only, for the remark plugins)
- [ ] Wire into `svelte.config.js`:
  ```js
  import { mdsvex } from 'mdsvex';
  import { remarkCallouts } from './src/lib/docs-content/remark-callouts.js';
  import { remarkCodeBlocks } from './src/lib/docs-content/remark-code-blocks.js';

  const mdsvexOptions = {
    extensions: ['.svx'],
    remarkPlugins: [remarkCallouts, remarkCodeBlocks]
  };

  export default {
    extensions: ['.svelte', '.svx'],
    preprocess: [vitePreprocess(), mdsvex(mdsvexOptions)]
    // ...existing kit config
  };
  ```
- [ ] Create `src/lib/docs-content/mdsvex-layout.svelte` — the shared layout
      every `.svx` file renders through. Responsibilities:
  - Import and expose `Callout`, `CodeBlock` in scope (required for the
    component tags the remark plugins emit to resolve)
  - Read `id` / `kicker` / `title` from the auto-injected `metadata` export
  - Render the `<section id={id}>`, `<div class="kicker mono">// {kicker}</div>`,
    `<h2 class="mono">{title}</h2>` wrapper currently duplicated per-section
    in `DocsContent.svelte` — this becomes the single place that markup lives
- [ ] Decide and document the frontmatter schema for structured (non-prose)
      data — see Phase 2.

**Known rough edges to watch for** (community-reported, not yet hit in our
PoC since it didn't use a shared layout): mdsvex layout `<script>` blocks can
collide with a content file's own `<script>` block if both declare the same
bindings, and `lang="ts"` support in layout scripts has had gaps. Keep the
layout's script minimal (just frontmatter destructuring + imports) to avoid
this.

---

## Phase 2 — Component-mapping plugins

| Component | Mechanism | Status |
|---|---|---|
| `Callout` | `remarkCallouts` — GFM alert blockquote → `hName`/`hProperties` | ✅ Validated (Phase 0) |
| `CodeBlock` | `remarkCodeBlocks` — fenced code block → component tag | ⚠️ Needs a decision (below) |
| `deftable` rows | Frontmatter array, rendered by the shared layout's existing markup | Design only, no plugin needed |
| `steplist` items | Frontmatter array, rendered by the shared layout's existing markup | Design only, no plugin needed |
| `api` table rows | Frontmatter array, rendered by the shared layout's existing markup | Design only, no plugin needed |
| `realbadge` swatch (badges section only) | Author directly as inline Svelte markup in the `.svx` body — it's a one-off decorative chip, not worth modeling as data | No plugin needed |

### `CodeBlock` — open decision

`CodeBlock` takes `code` as a string **prop**, not slotted children. A GFM
fenced code block's mdast `code` node carries `.lang` and `.value` (and an
optional `.meta` string for anything after the language token — e.g.
` ```bash file="deploy" `). The blocker: `hProperties` get serialized as
plain HTML attributes, which is fine for `Callout`'s short `variant`/`title`
strings but unsafe for multi-line code containing quotes, backticks, or
`${...}`-looking text.

Two options:

- **(A) Refactor `CodeBlock.svelte` to accept code via its default slot**
  instead of a `code` prop. Slotted text only needs standard HTML escaping,
  which `hChildren` handles natively — same mechanism already proven for
  `Callout`'s body. Touches `CodeBlock.svelte` itself.
- **(B) Keep `CodeBlock` as-is; have `remarkCodeBlocks` emit a raw `html`-type
  mdast node** whose value is literal Svelte source text, e.g.
  `` `<CodeBlock file="deploy" lang="bash" code={${JSON.stringify(value)}} />` ``,
  with the code value safely escaped via `JSON.stringify`. No changes to
  `CodeBlock.svelte`.

**Recommendation: (B).** Lower risk, zero changes to an already-working
component, and `JSON.stringify` handles all the escaping correctly by
construction. Validate with a smoke test extending the Phase 0 pattern
(compile a fixture with a multi-line fenced code block containing backticks
and `${}`, assert the compiled output contains a well-formed `code={...}`
expression) before migrating real content.

### Fenced-code `file=` convention

Adopt:
```
```bash file="deploy"
npm run deploy
```
```
`remarkCodeBlocks` parses `node.meta` for `file="..."`; absent → omit the
`file` prop (matches sections like `routing` in the current source that pass
only `file` without `lang` styling, and the few blocks with no file label).

---

## Phase 3 — Content migration

One `.svx` file per current section, in `src/lib/docs-content/`. `github-app`
already has a head start from Phase 0 (extend, don't restart).

| # | id | Needs |
|---|---|---|
| 1 | `overview` | prose, Callout |
| 2 | `how-it-works` | prose, steplist frontmatter, CodeBlock |
| 3 | `quick-start` | prose, ordered list, CodeBlock |
| 4 | `prerequisites` | prose |
| 5 | `domain-database` | prose, CodeBlock ×3, Callout |
| 6 | `github-app` | prose, Callout (done in PoC), deftable frontmatter, CodeBlock |
| 7 | `cloudflare-access` | prose, deftable frontmatter, Callout |
| 8 | `secrets` | prose, CodeBlock, Callout |
| 9 | `deploy` | prose, CodeBlock ×2 |
| 10 | `verify` | prose, CodeBlock |
| 11 | `ingest` | prose, CodeBlock |
| 12 | `badges` | prose, CodeBlock ×2, inline realbadge markup |
| 13 | `dashboard` | prose, Callout |
| 14 | `api` | api-table frontmatter |
| 15 | `ingest-payload` | prose, CodeBlock (json) |

For each file:
- [ ] Write frontmatter (`id`, `kicker`, `title`, plus `table:`/`steps:`/`api:`
      arrays where applicable)
- [ ] Convert prose to markdown; convert existing `Callout`/`CodeBlock` usages
      to the markdown-native forms (GFM alert / fenced code)
- [ ] Diff rendered output against the current live section visually

---

## Phase 4 — Routing & sidebar integration

- [ ] Glob-import all `.svx` files in order:
  ```ts
  const sections = import.meta.glob('/src/lib/docs-content/*.svx', { eager: true });
  ```
- [ ] Replace `DocsContent.svelte`'s hardcoded section markup with a loop
      rendering each imported component, preserving the original file order
      (sidebar groups in `DocsSidebar.svelte` reference section `id`s — these
      must still match exactly, since the `IntersectionObserver` scroll-spy
      depends on it)
- [ ] No changes needed to `DocsSidebar.svelte` itself (per Scope)

---

## Phase 5 — Validation & cutover

- [ ] Extend the Phase 0 smoke test to cover all 15 fixtures: frontmatter
      shape, `Callout` emission, `CodeBlock` emission (once Phase 2's
      decision is implemented)
- [ ] Full visual parity pass against the current deployed docs page
- [ ] Remove the old hardcoded markup from `DocsContent.svelte` once parity
      is confirmed
- [ ] Update `docs/PROGRESS.md` with a new phase entry tracking this work

---

## Risks / open decisions summary

1. **`CodeBlock` prop strategy** — recommend Option B (raw `html`-node
   injection with `JSON.stringify`-escaped `code` prop); validate with a
   smoke test before bulk migration.
2. **`.svx` vs `.md` extension** — use `.svx`. Once `Callout`/`CodeBlock` tags
   are embedded, the files are no longer pure CommonMark; `.svx` signals that
   honestly rather than implying GitHub/Obsidian-renderable purity that
   wouldn't actually hold.
3. **mdsvex + shared layout script collisions** — keep the layout's
   `<script>` minimal; this is a known community pain point, not yet hit in
   the Phase 0 PoC because it didn't use a shared layout.
4. **Sidebar taxonomy** — intentionally staying hardcoded (see Scope); revisit
   only if this migration reveals it's actually painful in practice.

---

## Appendix: validated reference implementation (Phase 0)

### `remark-callouts.ts`

```ts
import { visit } from 'unist-util-visit';
import type { Root, Blockquote, Paragraph, PhrasingContent } from 'mdast';

// Collapse GitHub's 5 alert kinds down to your Callout's 2 variants.
const VARIANT: Record<string, string> = {
  NOTE: 'info',
  TIP: 'info',
  IMPORTANT: 'info',
  WARNING: 'warn',
  CAUTION: 'warn'
};

/**
 * Turns:
 *   > [!WARNING] Custom title
 *   > Body text, can **include markdown**.
 *
 * into a Callout component invocation.
 *
 * IMPORTANT GOTCHA: "[!WARNING]" is NOT a plain-text token to CommonMark.
 * Square brackets are link syntax, so remark parses "[!WARNING]" as a
 * `linkReference` node (a "shortcut reference" — valid syntax even with
 * no matching link definition), not as a `text` node you can regex
 * against. The marker is the paragraph's *first inline child*, with
 * type `linkReference` and a `label` of "!WARNING" — the literal text
 * "[!WARNING]" never exists as a string anywhere in the tree.
 */
export function remarkCallouts() {
  return (tree: Root) => {
    visit(tree, 'blockquote', (node: Blockquote) => {
      const first = node.children[0] as Paragraph | undefined;
      if (first?.type !== 'paragraph') return;

      const [marker, ...rest] = first.children as PhrasingContent[];
      if (marker?.type !== 'linkReference') return;

      const labelMatch = /^!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)$/.exec(
        marker.label ?? ''
      );
      if (!labelMatch) return;

      const kind = labelMatch[1];

      // The text node immediately after the marker carries " Custom title"
      // up to the soft-break "\n", then the alert body.
      let inlineTitle = '';
      const next = rest[0];
      if (next?.type === 'text') {
        const newlineIndex = next.value.indexOf('\n');
        if (newlineIndex === -1) {
          inlineTitle = next.value.trim();
          rest.shift();
        } else {
          inlineTitle = next.value.slice(0, newlineIndex).trim();
          next.value = next.value.slice(newlineIndex + 1);
        }
      }

      first.children = rest; // drop the marker node, keep the body

      node.data = {
        hName: 'Callout',
        hProperties: {
          variant: VARIANT[kind],
          title: inlineTitle || kind.charAt(0) + kind.slice(1).toLowerCase()
        }
      };
    });
  };
}
```

### `github-app.svx`

```md
---
id: github-app
kicker: installation
title: GitHub App
---

> [!WARNING] Two separate integrations
> The **GitHub App** (this step) handles webhook events and API access. The **GitHub OAuth App** (next section) handles dashboard login via Cloudflare Access. Create them separately — do not conflate them.

From the account or org that will host the app, go to **Settings → Developer settings → GitHub Apps → New GitHub App** and fill in the required fields.
```

> Note: this is the Phase 0 fixture, not the complete section. Phase 3's
> `github-app` row still needs the required-fields table (→ `deftable`
> frontmatter), the permissions/events lists, and the private-key conversion
> `CodeBlock` added on top of this.

### `smoke-test.ts`

```ts
import { readFileSync } from 'node:fs';
import { compile } from 'mdsvex';
import { remarkCallouts } from './remark-callouts';

const FIXTURE = new URL('./github-app.svx', import.meta.url);

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS: ${message}`);
  }
}

async function main() {
  const source = readFileSync(FIXTURE, 'utf-8');

  const result = await compile(source, {
    remarkPlugins: [remarkCallouts]
  });

  if (!result) {
    console.error('FAIL: compile() returned nothing');
    process.exitCode = 1;
    return;
  }

  console.log('\n--- frontmatter (result.data?.fm) ---');
  console.log(JSON.stringify(result.data?.fm, null, 2));

  console.log('\n--- compiled Svelte source ---');
  console.log(result.code);
  console.log('--- end compiled source ---\n');

  // 1. Frontmatter mapping
  const fm = result.data?.fm as Record<string, unknown> | undefined;
  assert(fm?.id === 'github-app', 'frontmatter id === "github-app"');
  assert(fm?.kicker === 'installation', 'frontmatter kicker === "installation"');
  assert(fm?.title === 'GitHub App', 'frontmatter title === "GitHub App"');

  // 2. Remark callout plugin: GFM alert -> <Callout> component tag
  assert(
    /<Callout[^>]*variant="warn"[^>]*>/.test(result.code),
    'compiled output contains <Callout variant="warn" ...>'
  );
  assert(
    /title="Two separate integrations"/.test(result.code),
    'compiled output carries the inline alert title as a prop'
  );
  assert(
    !/\[!WARNING\]/.test(result.code),
    'the literal "[!WARNING]" marker text is stripped from the output'
  );
  assert(
    /do not conflate them/.test(result.code),
    "the alert body text survives as the Callout's children"
  );

  if (process.exitCode === 1) {
    console.error('\nSMOKE TEST FAILED');
  } else {
    console.log('\nSMOKE TEST PASSED');
  }
}

async function noTitleCase() {
  // GFM alerts don't require an inline title — confirm the fallback
  // ("Note", "Tip", etc.) kicks in and the bare marker line is consumed.
  const source = [
    '---',
    'id: scratch',
    'kicker: test',
    'title: Scratch',
    '---',
    '',
    '> [!NOTE]',
    '> Plain note, no custom title.'
  ].join('\n');

  const result = await compile(source, { remarkPlugins: [remarkCallouts] });
  assert(
    /<Callout variant="info" title="Note">/.test(result!.code),
    'no-inline-title alert falls back to title="Note" with variant="info"'
  );
  assert(
    /Plain note, no custom title\./.test(result!.code),
    'no-inline-title alert body is preserved'
  );
}

main().then(noTitleCase);
```

**To run:**
```bash
npm install mdsvex unist-util-visit
npm install -D tsx typescript @types/node @types/mdast
npx tsx smoke-test.ts
```
Expected: 9 `PASS` lines, `SMOKE TEST PASSED`.
