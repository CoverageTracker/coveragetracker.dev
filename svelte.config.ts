import adapter from '@sveltejs/adapter-cloudflare';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { resolve } from 'path';
import type { Config } from '@sveltejs/kit';
import type { PreprocessorGroup } from 'svelte/compiler';
import { remarkCallouts } from './src/lib/docs-content/remark-callouts.js';
import { remarkCodeBlocks } from './src/lib/docs-content/remark-code-blocks.ts';

/**
 * Post-mdsvex preprocessor: injects Callout/CodeBlock imports into .svx files.
 *
 * mdsvex remark plugins emit <Callout> and <CodeBlock> tags in the compiled
 * Svelte markup, but those component references are not automatically imported.
 * This preprocessor runs after mdsvex and injects the required imports so
 * Svelte can resolve the component names at compile time.
 */
function injectDocComponents(): PreprocessorGroup {
  return {
    markup({ content, filename }) {
      if (!filename?.endsWith('.svx')) return;

      const needsCallout = /<Callout[\s/>]/.test(content);
      const needsCodeBlock = /<CodeBlock[\s/>]/.test(content);
      if (!needsCallout && !needsCodeBlock) return;

      const imports = [
        needsCallout && "import Callout from '$lib/components/docs/Callout.svelte';",
        needsCodeBlock && "import CodeBlock from '$lib/components/docs/CodeBlock.svelte';"
      ]
        .filter(Boolean)
        .join('\n  ');

      if (/<script\b/.test(content)) {
        return { code: content.replace(/(<script\b[^>]*>)/, `$1\n  ${imports}`) };
      }
      return { code: `<script>\n  ${imports}\n</script>\n${content}` };
    }
  };
}

const config: Config = {
  extensions: ['.svelte', '.svx'],
  preprocess: [
    vitePreprocess(),
    mdsvex({
      extensions: ['.svx'],
      layout: resolve('./src/lib/docs-content/mdsvex-layout.svelte'),
      remarkPlugins: [remarkCallouts, remarkCodeBlocks]
    }),
    injectDocComponents()
  ],
  kit: {
    adapter: adapter()
  }
};

export default config;
