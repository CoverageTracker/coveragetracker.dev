<script lang="ts">
  import { onMount } from 'svelte';
  import { sidebarGroups as groups } from '$lib/docs-content/index';

  let active = $state('overview');
  let open = $state(false);

  onMount(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('.content section'));
    if (!sections.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const vis = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (vis.length) active = vis[0].target.id;
      },
      { rootMargin: '-88px 0px -65% 0px', threshold: 0 }
    );

    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  });

  function onPick() {
    if (typeof window !== 'undefined' && window.innerWidth <= 900) open = false;
  }
</script>

<aside class="side" class:open>
  <button class="side-toggle mono" onclick={() => (open = !open)}>
    On this page
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6" /></svg>
  </button>

  <div class="side-inner">
    {#each groups as g}
      <nav class="side-group">
        <h4 class="mono">{g.head}</h4>
        {#each g.items as it}
          <a href="#{it.id}" class:active={active === it.id} onclick={onPick}>{it.label}</a>
        {/each}
      </nav>
    {/each}
  </div>
</aside>

<style>
  .side {
    position: sticky;
    top: 88px;
    max-height: calc(100vh - 108px);
    overflow-y: auto;
    padding-right: 8px;
  }
  .side::-webkit-scrollbar { width: 8px; }
  .side::-webkit-scrollbar-thumb { background: var(--elevated); border-radius: 8px; }

  .side-group { margin-bottom: 26px; }
  .side-group h4 {
    font-size: 11px;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--muted);
    margin: 0 0 10px;
    padding-left: 13px;
  }
  .side-group a {
    display: block;
    font-size: 13.5px;
    color: var(--muted);
    padding: 6px 13px;
    border-left: 2px solid transparent;
    line-height: 1.4;
    border-radius: 0 6px 6px 0;
    transition: color 120ms ease, background 120ms ease, border-color 120ms ease;
  }
  .side-group a:hover { color: var(--text); background: var(--card); }
  .side-group a.active {
    color: var(--primary);
    border-left-color: var(--primary);
    background: var(--accent-fill);
    font-weight: 600;
  }

  .side-toggle { display: none; }

  @media (max-width: 900px) {
    .side {
      position: static;
      max-height: none;
      overflow: visible;
      margin-bottom: 8px;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 14px;
      background: var(--card);
    }
    .side-inner { display: none; }
    .side.open .side-inner { display: block; }
    .side-toggle {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
      background: transparent;
      border: 0;
      color: var(--text);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      padding: 0;
    }
    .side-toggle svg { width: 16px; height: 16px; color: var(--muted); }
    .side.open .side-toggle { margin-bottom: 12px; }
  }
</style>
