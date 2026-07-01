import { describe, it, expect } from 'vitest';
import { compile } from 'mdsvex';
import { remarkCallouts } from './remark-callouts.js';
import { remarkCodeBlocks } from './remark-code-blocks.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function md(body: string): string {
  return ['---', 'id: test', 'kicker: test', 'title: Test', '---', '', body].join('\n');
}

async function compiled(body: string, plugins: unknown[] = []): Promise<string> {
  const result = await compile(md(body), { remarkPlugins: plugins as never[] });
  if (!result) throw new Error('compile() returned nothing');
  return result.code;
}

// ---------------------------------------------------------------------------
// remarkCallouts
// ---------------------------------------------------------------------------

describe('remarkCallouts', () => {
  it('maps [!WARNING] with inline title to <Callout variant="warn" title="...">', async () => {
    const code = await compiled(
      '> [!WARNING] Two separate integrations\n> Body text here.',
      [remarkCallouts]
    );
    expect(code).toMatch(/<Callout[^>]*variant="warn"[^>]*>/);
    expect(code).toMatch(/title="Two separate integrations"/);
  });

  it('maps [!NOTE] to variant="info"', async () => {
    const code = await compiled('> [!NOTE] A note\n> Body.', [remarkCallouts]);
    expect(code).toMatch(/<Callout[^>]*variant="info"[^>]*>/);
  });

  it('maps [!TIP] to variant="info"', async () => {
    const code = await compiled('> [!TIP] A tip\n> Body.', [remarkCallouts]);
    expect(code).toMatch(/<Callout[^>]*variant="info"[^>]*>/);
  });

  it('falls back to capitalised kind name when no inline title is given', async () => {
    const code = await compiled('> [!NOTE]\n> Plain note, no custom title.', [remarkCallouts]);
    expect(code).toMatch(/<Callout[^>]*variant="info"[^>]*title="Note"[^>]*>/);
  });

  it('strips the [!WARNING] marker text from output', async () => {
    const code = await compiled('> [!WARNING] Title\n> Body.', [remarkCallouts]);
    expect(code).not.toMatch(/\[!WARNING\]/);
  });

  it('preserves alert body text as Callout children', async () => {
    const code = await compiled(
      '> [!WARNING] Two separate integrations\n> do not conflate them.',
      [remarkCallouts]
    );
    expect(code).toMatch(/do not conflate them/);
  });

  it('preserves no-title alert body', async () => {
    const code = await compiled('> [!NOTE]\n> Plain note, no custom title.', [remarkCallouts]);
    expect(code).toMatch(/Plain note, no custom title\./);
  });

  it('preserves a multi-line body spanning several adjacent > lines', async () => {
    const code = await compiled(
      '> [!WARNING]\n> This is a warning.\n> It spans multiple content lines.',
      [remarkCallouts]
    );
    expect(code).toMatch(/<Callout[^>]*variant="warn"[^>]*title="Warning"[^>]*>/);
    expect(code).toMatch(/This is a warning\./);
    expect(code).toMatch(/It spans multiple content lines\./);
  });

  it('handles [!IMPORTANT] as variant="info"', async () => {
    const code = await compiled('> [!IMPORTANT] Critical\n> Read this.', [remarkCallouts]);
    expect(code).toMatch(/<Callout[^>]*variant="info"[^>]*>/);
  });

  it('handles [!CAUTION] as variant="warn"', async () => {
    const code = await compiled('> [!CAUTION] Watch out\n> Careful.', [remarkCallouts]);
    expect(code).toMatch(/<Callout[^>]*variant="warn"[^>]*>/);
  });
});

// ---------------------------------------------------------------------------
// remarkCodeBlocks
// ---------------------------------------------------------------------------

describe('remarkCodeBlocks', () => {
  it('converts a fenced code block to <CodeBlock code={...} />', async () => {
    const code = await compiled('```\nhello world\n```', [remarkCodeBlocks]);
    expect(code).toMatch(/<CodeBlock code=\{"hello world"\}/);
  });

  it('includes file and lang props when present in meta', async () => {
    const code = await compiled('```bash file="deploy"\nnpm run deploy\n```', [remarkCodeBlocks]);
    expect(code).toMatch(/lang="bash"/);
    expect(code).toMatch(/file="deploy"/);
  });

  it('omits file and lang props when meta is absent', async () => {
    const code = await compiled('```\nplain\n```', [remarkCodeBlocks]);
    expect(code).not.toMatch(/lang=/);
    expect(code).not.toMatch(/file=/);
  });

  it('safely JSON-encodes backticks in code value', async () => {
    const code = await compiled('```\necho `hello`\n```', [remarkCodeBlocks]);
    expect(code).toMatch(/code=\{"echo `hello`"\}/);
  });

  it('safely JSON-encodes ${...} expressions in code value', async () => {
    const code = await compiled('```\necho ${VAR}\n```', [remarkCodeBlocks]);
    // JSON.stringify wraps in double quotes; ${VAR} is safe inside a JSON string
    expect(code).toMatch(/code=\{"echo \$\{VAR\}"\}/);
  });

  it('includes only lang when file meta is absent', async () => {
    const code = await compiled('```json\n{}\n```', [remarkCodeBlocks]);
    expect(code).toMatch(/lang="json"/);
    expect(code).not.toMatch(/file=/);
  });

  it('includes only file when lang is absent', async () => {
    const code = await compiled('```text file="routing"\nGET /\n```', [remarkCodeBlocks]);
    expect(code).toMatch(/file="routing"/);
  });

  it('handles multi-line code with newlines', async () => {
    const code = await compiled('```bash\nline1\nline2\n```', [remarkCodeBlocks]);
    expect(code).toMatch(/code=\{"line1\\nline2"\}/);
  });
});
