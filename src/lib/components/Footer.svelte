<script lang="ts">
  import BrandMark from './BrandMark.svelte';

  const cols = [
    {
      head: 'Product',
      links: [
        { label: 'Features', href: '/#features' },
        { label: 'How it works', href: '/#how' },
        { label: 'Themes', href: '/#themes' }
      ]
    },
    {
      head: 'Developers',
      links: [
        { label: 'Documentation', href: '/docs' },
        { label: 'Self-host guide', href: '/docs#prerequisites' },
        { label: 'API reference', href: '/docs#api' },
        { label: 'Changelog', href: 'https://github.com/CoverageTracker/coverage-tracker/releases' }
      ]
    },
    {
      head: 'Project',
      links: [
        { label: 'GitHub', href: 'https://github.com/CoverageTracker/coverage-tracker' },
        { label: 'Issues', href: 'https://github.com/CoverageTracker/coverage-tracker/issues' },
        { label: 'Discussions', href: 'https://github.com/CoverageTracker/coverage-tracker/discussions' },
        { label: 'License', href: 'https://github.com/CoverageTracker/coverage-tracker/blob/main/LICENSE' }
      ]
    }
  ];
</script>

<footer>
  <div class="wrap top">
    <div class="fbrand">
      <a class="brand mono" href="/"><BrandMark />Coverage Tracker</a>
      <p>Self-hosted code coverage and quality tracking for GitHub repositories. MIT licensed.</p>
    </div>
    {#each cols as c}
      <div class="fcol">
        <h4 class="mono">{c.head}</h4>
        {#each c.links as l}<a href={l.href}>{l.label}</a>{/each}
      </div>
    {/each}
  </div>
  <div class="wrap">
    <div class="copyright mono">
      <span>© 2026 Coverage Tracker · MIT</span>
      <span>coveragetracker.dev</span>
    </div>
  </div>
</footer>

<style>
  footer { padding: 54px 0 64px; }
  .top { display: flex; justify-content: space-between; gap: 32px; flex-wrap: wrap; }
  .brand { display: flex; align-items: center; gap: 10px; font-weight: 700; font-size: 16px; }
  .fbrand { max-width: 280px; }
  .fbrand p { font-size: 13px; color: var(--muted); line-height: 1.6; margin: 14px 0 0; }
  .fcol h4 { font-size: 12px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); margin: 0 0 14px; }
  .fcol a { display: block; font-size: 14px; color: var(--muted); margin-bottom: 9px; transition: color 120ms ease; }
  .fcol a:hover { color: var(--text); }
  .copyright { margin-top: 40px; padding-top: 24px; border-top: 1px solid var(--border); font-size: 12px; color: var(--muted); display: flex; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
</style>
