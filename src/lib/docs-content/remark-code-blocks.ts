import { createHighlighter, createCssVariablesTheme, type Highlighter } from 'shiki';
import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';

declare global {
  // eslint-disable-next-line no-var
  var __shikiHighlighterPromise: Promise<Highlighter> | undefined;
}

const cssVarsTheme = createCssVariablesTheme({ name: 'css-variables', variablePrefix: '--shiki-', fontStyle: true });

if (!globalThis.__shikiHighlighterPromise) {
  globalThis.__shikiHighlighterPromise = createHighlighter({
    themes: [cssVarsTheme],
    langs: [
      'bash', 'sh', 'shell',
      'json', 'jsonc', 'yaml', 'toml',
      'typescript', 'javascript', 'jsx', 'tsx',
      'svelte',
      'markdown',
      'rust', 'go',
      'sql',
      'python',
      'html', 'css',
      'diff',
      'text'
    ]
  });
}

const highlighterPromise: Promise<Highlighter> = globalThis.__shikiHighlighterPromise;

export function remarkCodeBlocks(): (tree: Root) => Promise<void> {
  return async (tree) => {
    const highlighter = await highlighterPromise;
    const supported = new Set(highlighter.getLoadedLanguages());

    visit(tree, 'code', (node, index, parent) => {
      if (!parent || index === undefined) return;

      const lang = node.lang ?? '';
      const fileMatch = /file="([^"]+)"/.exec(node.meta ?? '');
      const file = fileMatch?.[1] ?? '';
      const code = JSON.stringify(node.value);

      const resolvedLang = lang && supported.has(lang) ? lang : 'text';

      let highlighted;
      try {
        highlighted = highlighter.codeToHtml(node.value, {
          lang: resolvedLang,
          theme: 'css-variables'
        });
      } catch {
        highlighted = highlighter.codeToHtml(node.value, { lang: 'text', theme: 'css-variables' });
      }

      const props = [
        `code={${code}}`,
        `highlighted={${JSON.stringify(highlighted)}}`,
        lang && `lang="${lang}"`,
        file && `file="${file}"`
      ]
        .filter(Boolean)
        .join(' ');

      (parent.children as any[])[index] = {
        type: 'html',
        value: `<CodeBlock ${props} />`
      };
    });
  };
}
