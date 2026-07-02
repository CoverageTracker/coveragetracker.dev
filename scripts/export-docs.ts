/**
 * Docs export pipeline: renders configured .svx files from src/lib/docs-content
 * into plain GitHub markdown inside a checkout of CoverageTracker/coverage-tracker.
 *
 * Usage: node --experimental-strip-types scripts/export-docs.ts <coverage-tracker-repo-root>
 *
 * The generated files carry a GENERATED header and must never be edited in the
 * downstream repo — this repo is the origin of truth for docs content.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CONTENT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'lib', 'docs-content');

export type ExportTarget = {
  /** Path of the generated file, relative to the coverage-tracker repo root. */
  targetPath: string;
  /** Source .svx filenames in src/lib/docs-content, in emission order. */
  sources: string[];
  /**
   * H1 for multi-source targets; each source becomes an H2 section.
   * Omit for single-source targets — the frontmatter title becomes the H1
   * and body headings are promoted one level (### → ##).
   */
  title?: string;
  /** Optional paragraph emitted between the H1 and the first section. */
  intro?: string;
};

// Explicit list — no globbing; additions are deliberate.
export const targets: ExportTarget[] = [
  {
    targetPath: 'docs/generating-coverage-reports.md',
    sources: ['12-generating-coverage-reports.svx']
  },
  {
    targetPath: 'docs/INSTALLATION.md',
    title: 'Installation Guide',
    intro:
      'This guide walks through deploying coverage-tracker to your own Cloudflare account.\n' +
      'Follow the sections in order — several decisions depend on values produced by earlier steps.',
    sources: [
      '03-quick-start.svx',
      '04-prerequisites.svx',
      '05-domain-database.svx',
      '06-github-app.svx',
      '07-cloudflare-access.svx',
      '08-secrets.svx',
      '09-deploy.svx',
      '10-verify.svx',
      '11-ingest.svx',
      '13-badges.svx',
      '14-dashboard.svx'
    ]
  }
];

export function parseSvx(raw: string): { title: string; body: string } {
  const text = raw.replace(/\r\n/g, '\n');
  const match = /^---\n([\s\S]*?)\n---\n/.exec(text);
  if (!match) throw new Error('missing frontmatter');
  const title = /^title:\s*(.+)$/m.exec(match[1])?.[1]?.trim();
  if (!title) throw new Error('missing title in frontmatter');
  return { title, body: text.slice(match[0].length).trim() };
}

/**
 * GitHub only renders `> [!NOTE]` as an alert when the marker is alone on its
 * line; the site's callout syntax allows an inline title after the marker.
 * Move the title to a bold line of its own, dropping it when it just repeats
 * the marker (e.g. "> [!NOTE] Note").
 */
export function transformCallouts(body: string): string {
  return body
    .split('\n')
    .flatMap((line) => {
      const m = /^(\s*)> \[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]+(\S.*)$/.exec(line);
      if (!m) return [line];
      const [, indent, kind, title] = m;
      const marker = `${indent}> [!${kind}]`;
      if (title.trim().toLowerCase() === kind.toLowerCase()) return [marker];
      return [marker, `${indent}> **${title.trim()}**`];
    })
    .join('\n');
}

/**
 * Removes blocks wrapped in `<!-- site-only -->` … `<!-- /site-only -->` —
 * decorative markup that only makes sense with the site's CSS.
 */
export function stripSiteOnly(body: string): string {
  return body.replace(/[ \t]*<!-- site-only -->[\s\S]*?<!-- \/site-only -->[ \t]*\n?/g, '').trimEnd();
}

/** Promote headings one level (### → ##), skipping fenced code blocks. */
export function promoteHeadings(body: string): string {
  let inFence = false;
  return body
    .split('\n')
    .map((line) => {
      if (/^(```|~~~)/.test(line)) inFence = !inFence;
      if (inFence) return line;
      return line.replace(/^##(#*) /, '#$1 ');
    })
    .join('\n');
}

export function renderTarget(target: ExportTarget, readSource: (name: string) => string): string {
  const docs = target.sources.map((name) => {
    const { title, body } = parseSvx(readSource(name));
    return { name, title, body: transformCallouts(stripSiteOnly(body)) };
  });

  const header = `<!-- GENERATED from coveragetracker.dev ${
    docs.length === 1
      ? `src/lib/docs-content/${docs[0].name}`
      : `src/lib/docs-content (${docs.map((d) => d.name).join(', ')})`
  } — do not edit here -->`;

  let out: string;
  if (target.title === undefined) {
    out = `${header}\n\n# ${docs[0].title}\n\n${promoteHeadings(docs[0].body)}`;
  } else {
    const sections = docs.map((d) => `## ${d.title}\n\n${d.body}`);
    const head = [header, `# ${target.title}`, target.intro].filter(Boolean).join('\n\n');
    out = [head, ...sections].join('\n\n---\n\n');
  }
  return `${out.trimEnd()}\n`;
}

function main(): void {
  const repoRoot = process.argv[2];
  if (!repoRoot || !existsSync(repoRoot)) {
    console.error('usage: node --experimental-strip-types scripts/export-docs.ts <coverage-tracker-repo-root>');
    process.exit(1);
  }

  for (const target of targets) {
    const rendered = renderTarget(target, (name) => readFileSync(join(CONTENT_DIR, name), 'utf8'));
    const outPath = join(repoRoot, target.targetPath);
    const previous = existsSync(outPath) ? readFileSync(outPath, 'utf8') : null;
    if (previous === rendered) {
      console.log(`unchanged  ${target.targetPath}`);
      continue;
    }
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, rendered);
    console.log(`written    ${target.targetPath}`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
