<script lang="ts">
  import { page } from '$app/stores';
  import BrandMark from './BrandMark.svelte';
  import ThemePicker from './ThemePicker.svelte';

  // Route-absolute hrefs so the nav works from any page (landing or /docs).
  const links = [
    { href: '/#features', label: 'Features' },
    { href: '/#how', label: 'How it works' },
    { href: '/#themes', label: 'Themes' },
    { href: '/docs', label: 'Docs' }
  ];

  const isActive = (href: string) => href === '/docs' && $page.url.pathname.startsWith('/docs');
</script>

<nav>
  <div class="wrap inner">
    <a class="brand mono" href="/">
      <BrandMark />
      Coverage Tracker
    </a>

    <div class="navlinks">
      {#each links as l}
        <a href={l.href} class:current={isActive(l.href)}>{l.label}</a>
      {/each}
    </div>

    <div class="navright">
      <ThemePicker />
      <a class="ghost mono" href="https://github.com/CoverageTracker/coverage-tracker" target="_blank" rel="noreferrer">GitHub ↗</a>
    </div>
  </div>
</nav>

<style>
  nav {
    position: sticky; top: 0; z-index: 40; height: 64px; display: flex; align-items: center;
    background: color-mix(in srgb, var(--bg) 86%, transparent);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid var(--border);
  }
  .inner { display: flex; align-items: center; width: 100%; box-sizing: border-box; }
  .brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 16px; }
  .navlinks { display: flex; gap: 26px; margin-left: 42px; font-size: 14px; color: var(--muted); }
  .navlinks a { transition: color 120ms ease; }
  .navlinks a:hover { color: var(--text); }
  .navlinks a.current { color: var(--text); }
  .navright { margin-left: auto; display: flex; align-items: center; gap: 16px; }
  .ghost { font-size: 13px; color: var(--muted); transition: color 120ms ease; }
  .ghost:hover { color: var(--text); }
  @media (max-width: 760px) { .navlinks { display: none; } }
</style>
