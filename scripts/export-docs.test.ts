import { describe, it, expect } from 'vitest';
import {
  parseSvx,
  transformCallouts,
  promoteHeadings,
  stripSiteOnly,
  renderTarget,
  targets
} from './export-docs.ts';

// ---------------------------------------------------------------------------
// parseSvx
// ---------------------------------------------------------------------------

describe('parseSvx', () => {
  it('extracts the frontmatter title and the body', () => {
    const { title, body } = parseSvx('---\nid: x\ntitle: Hello world\ngroup: usage\n---\n\nBody text.\n');
    expect(title).toBe('Hello world');
    expect(body).toBe('Body text.');
  });

  it('handles CRLF line endings', () => {
    const { title, body } = parseSvx('---\r\ntitle: T\r\n---\r\nBody.\r\n');
    expect(title).toBe('T');
    expect(body).toBe('Body.');
  });

  it('throws on missing frontmatter', () => {
    expect(() => parseSvx('no frontmatter')).toThrow(/frontmatter/);
  });

  it('throws when frontmatter has no title', () => {
    expect(() => parseSvx('---\nid: x\n---\nBody.')).toThrow(/title/);
  });
});

// ---------------------------------------------------------------------------
// transformCallouts
// ---------------------------------------------------------------------------

describe('transformCallouts', () => {
  it('moves an inline callout title to a bold line so GitHub renders the alert', () => {
    expect(transformCallouts('> [!WARNING] Two integrations\n> Body.')).toBe(
      '> [!WARNING]\n> **Two integrations**\n> Body.'
    );
  });

  it('drops the title when it just repeats the marker kind', () => {
    expect(transformCallouts('> [!NOTE] Note\n> Body.')).toBe('> [!NOTE]\n> Body.');
  });

  it('leaves bare markers untouched', () => {
    expect(transformCallouts('> [!NOTE]\n> Body.')).toBe('> [!NOTE]\n> Body.');
  });

  it('does not touch code inside a blockquote', () => {
    const block = '> [!NOTE]\n> ```bash\n> echo hi\n> ```';
    expect(transformCallouts(block)).toBe(block);
  });
});

// ---------------------------------------------------------------------------
// stripSiteOnly
// ---------------------------------------------------------------------------

describe('stripSiteOnly', () => {
  it('removes site-only blocks including their markers', () => {
    const body = 'Before.\n\n<!-- site-only -->\n<span class="realbadge">94%</span>\n<!-- /site-only -->';
    expect(stripSiteOnly(body)).toBe('Before.');
  });

  it('leaves bodies without markers untouched', () => {
    expect(stripSiteOnly('Just text.')).toBe('Just text.');
  });
});

// ---------------------------------------------------------------------------
// promoteHeadings
// ---------------------------------------------------------------------------

describe('promoteHeadings', () => {
  it('promotes headings one level', () => {
    expect(promoteHeadings('### Coverage\n\n#### Sub')).toBe('## Coverage\n\n### Sub');
  });

  it('skips lines inside fenced code blocks', () => {
    const body = '### Head\n\n```bash\n# a comment\n## not a heading\n```\n\n### Tail';
    expect(promoteHeadings(body)).toBe('## Head\n\n```bash\n# a comment\n## not a heading\n```\n\n## Tail');
  });
});

// ---------------------------------------------------------------------------
// renderTarget
// ---------------------------------------------------------------------------

const sources: Record<string, string> = {
  'one.svx': '---\ntitle: Page one\n---\n\nIntro.\n\n### Details\n\n> [!NOTE] Heads up\n> Careful.',
  'two.svx': '---\ntitle: Page two\n---\n\nMore.'
};
const read = (name: string) => sources[name];

describe('renderTarget', () => {
  it('renders a single-source target with H1 from frontmatter and promoted headings', () => {
    const out = renderTarget({ targetPath: 'docs/one.md', sources: ['one.svx'] }, read);
    expect(out).toContain('<!-- GENERATED from coveragetracker.dev src/lib/docs-content/one.svx — do not edit here -->');
    expect(out).toContain('# Page one');
    expect(out).toContain('## Details');
    expect(out).toContain('> [!NOTE]\n> **Heads up**');
    expect(out.endsWith('\n')).toBe(true);
  });

  it('renders a multi-source target with configured H1 and H2 sections', () => {
    const out = renderTarget(
      { targetPath: 'docs/all.md', title: 'Guide', intro: 'Read in order.', sources: ['one.svx', 'two.svx'] },
      read
    );
    expect(out).toContain('# Guide');
    expect(out).toContain('Read in order.');
    expect(out).toContain('## Page one');
    expect(out).toContain('## Page two');
    // body headings keep their level in multi-source targets
    expect(out).toContain('### Details');
    expect(out).toContain('one.svx, two.svx');
  });
});

// ---------------------------------------------------------------------------
// config sanity — every configured source must exist on disk
// ---------------------------------------------------------------------------

describe('targets config', () => {
  it('references only .svx files that exist', async () => {
    const { existsSync } = await import('node:fs');
    const { join } = await import('node:path');
    for (const target of targets) {
      for (const source of target.sources) {
        expect(existsSync(join('src/lib/docs-content', source)), source).toBe(true);
      }
    }
  });
});
