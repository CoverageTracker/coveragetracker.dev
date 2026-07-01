<script lang="ts">
  import type { Component } from 'svelte';

  const mods = import.meta.glob('/src/lib/docs-content/*.svx', { eager: true });
  const sections = Object.values(mods) as Array<{
    default: Component;
    metadata: { id: string };
  }>;
</script>

<main class="content">
  {#each sections as mod}
    <section id={mod.metadata.id}>
      <mod.default />
    </section>
  {/each}

  <div class="pagefoot">
    <a class="pf" href="/#how"><span class="pl mono">← Back to</span><span class="pt mono">Marketing site</span></a>
    <a class="pf right" href="#overview"><span class="pl mono">Top ↑</span><span class="pt mono">Overview</span></a>
  </div>
</main>

<style>
  .content { min-width: 0; max-width: 760px; }

  .pagefoot { margin-top: 54px; padding-top: 24px; border-top: 1px solid var(--border); display: flex; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
  .pf { display: inline-flex; flex-direction: column; gap: 3px; padding: 14px 18px; border: 1px solid var(--border); border-radius: 10px; background: var(--card); transition: border-color 120ms ease; }
  .pf:hover { border-color: var(--primary); }
  .pf.right { text-align: right; align-items: flex-end; }
  .pl { font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }
  .pt { font-size: 14px; font-weight: 600; color: var(--text); }
</style>
