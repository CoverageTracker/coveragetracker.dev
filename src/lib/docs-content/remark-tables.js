// @ts-check
import { visit } from 'unist-util-visit';

/**
 * Tags markdown pipe tables with the site's `deftable` class so they pick up
 * the same styling as the hand-written HTML tables in other sections.
 *
 * @returns {(tree: import('mdast').Root) => void}
 */
export function remarkTables() {
  return (tree) => {
    visit(tree, 'table', (node) => {
      const data = /** @type {any} */ (node.data ??= {});
      data.hProperties = { ...data.hProperties, className: 'deftable' };
    });
  };
}
