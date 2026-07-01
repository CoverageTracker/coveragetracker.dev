// @ts-check
import { createHighlighter, createCssVariablesTheme } from 'shiki';
import { visit } from 'unist-util-visit';

const cssVarsTheme = createCssVariablesTheme({ name: 'css-variables', variablePrefix: '--shiki-', fontStyle: true });

/** @type {import('shiki').Highlighter | undefined} */
let hl;

async function getHighlighter() {
  if (!hl) {
    hl = await createHighlighter({
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
  return hl;
}

/**
 * Converts fenced code blocks to <CodeBlock> component tags with Shiki-highlighted
 * HTML pre-rendered at build time using the css-variables theme.
 *
 * @returns {(tree: import('mdast').Root) => Promise<void>}
 */
export function remarkCodeBlocks() {
  return async (tree) => {
    const highlighter = await getHighlighter();
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

      /** @type {any} */ (parent.children)[index] = {
        type: 'html',
        value: `<CodeBlock ${props} />`
      };
    });
  };
}
