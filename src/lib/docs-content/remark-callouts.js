// @ts-check
import { visit } from 'unist-util-visit';

/** @type {Record<string, string>} */
const VARIANT = {
  NOTE: 'info',
  TIP: 'info',
  IMPORTANT: 'info',
  WARNING: 'warn',
  CAUTION: 'warn'
};

/**
 * Turns GFM alert blockquotes into <Callout> component tags.
 *
 * GOTCHA: "[!WARNING]" is parsed by remark as a `linkReference` node
 * (shortcut reference), NOT a text node. The label is "!WARNING" — the
 * literal "[!WARNING]" string never exists in the AST.
 *
 * @returns {(tree: import('mdast').Root) => void}
 */
export function remarkCallouts() {
  return (tree) => {
    visit(tree, 'blockquote', (node) => {
      const first = /** @type {import('mdast').Paragraph | undefined} */ (node.children[0]);
      if (first?.type !== 'paragraph') return;

      const [marker, ...rest] = /** @type {import('mdast').PhrasingContent[]} */ (first.children);
      if (marker?.type !== 'linkReference') return;

      const labelMatch = /^!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)$/.exec(marker.label ?? '');
      if (!labelMatch) return;

      const kind = labelMatch[1];

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

      first.children = rest;

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
