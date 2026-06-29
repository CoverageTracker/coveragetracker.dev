<script lang="ts">
  // Feather/Lucide-style inline icons (stroke, currentColor) drawn as path data.
  type Feature = { title: string; body: string; paths: string[] };

  const features: Feature[] = [
    {
      title: 'Trends over time',
      body: 'Coverage, complexity, duplication, cognitive load and maintainability — tracked per branch, charted across 30 days and beyond.',
      paths: ['M3 3v18h18', 'M19 9l-5 5-4-4-3 3']
    },
    {
      title: 'Status badges',
      body: 'Generate shields.io endpoint badges for any metric. Drop the Markdown into your README and the number stays current.',
      paths: ['M3 3h18v18H3z', 'M9 12l2 2 4-4']
    },
    {
      title: 'Self-hosted',
      body: 'Runs on Cloudflare Workers from your own account. Your coverage data never leaves your infrastructure.',
      paths: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z']
    },
    {
      title: 'GitHub-native',
      body: 'Install the GitHub App, grant repo access, and Coverage Tracker picks up owners, repos, default branches and avatars automatically.',
      paths: ['M8 7l8 9']
    },
    {
      title: 'One-step ingest',
      body: 'Add the reporting Action to your workflow. It auto-detects Go, Python, and JavaScript coverage reports, collects complexity and duplication, then posts everything with a GitHub Actions OIDC token — no static secret.',
      paths: ['M2 12h6m8 0h6']
    },
    {
      title: 'Six editor themes',
      body: 'Catppuccin, Gruvbox, Nord, Solarized, Dracula, Tokyo Night — light and dark. The dashboard looks like the editor you already use.',
      paths: ['M2 12h6m8 0h6']
    }
  ];

  // distinct icon glyphs per card (kept inline for stroke fidelity)
  const icons = [
    '<path d="M3 3v18h18"/><path d="M19 9l-5 5-4-4-3 3"/>',
    '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/>',
    '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    '<circle cx="12" cy="12" r="3"/><circle cx="6" cy="6" r="2"/><circle cx="18" cy="18" r="2"/><path d="M8 7l8 9"/>',
    '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    '<path d="M2 12h6m8 0h6"/><circle cx="12" cy="12" r="4"/>'
  ];
</script>

<section class="block" id="features">
  <div class="wrap">
    <div class="sec-eyebrow mono">// what you get</div>
    <h2 class="sec-title mono">Metrics that live with your code</h2>
    <p class="sec-lede">
      Every commit pushes a sample. Coverage Tracker stores the history and renders the trend,
      so regressions are visible the moment they land — not at release.
    </p>

    <div class="grid">
      {#each features as f, i}
        <article class="feat">
          <div class="ic">
            <!-- eslint-disable-next-line svelte/no-at-html-tags -->
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">{@html icons[i]}</svg>
          </div>
          <h3 class="mono">{f.title}</h3>
          <p>{f.body}</p>
        </article>
      {/each}
    </div>
  </div>
</section>

<style>
  .block { padding: 84px 0; border-bottom: 1px solid var(--border); }
  .sec-eyebrow { font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--primary); margin-bottom: 14px; }
  .sec-title { font-size: 34px; font-weight: 700; letter-spacing: -0.01em; margin: 0 0 16px; }
  .sec-lede { font-size: 17px; color: var(--muted); max-width: 600px; line-height: 1.55; margin: 0 0 44px; }

  .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
  .feat { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 22px; transition: border-color 120ms ease, box-shadow 120ms ease; }
  .feat:hover { border-color: var(--primary); box-shadow: 0 0 0 3px var(--ring); }
  .ic { width: 38px; height: 38px; border-radius: 9px; background: var(--accent-fill); display: flex; align-items: center; justify-content: center; color: var(--primary); margin-bottom: 16px; }
  .feat h3 { font-size: 16px; font-weight: 600; margin: 0 0 8px; }
  .feat p { font-size: 13.5px; line-height: 1.55; color: var(--muted); margin: 0; }

  @media (max-width: 880px) { .grid { grid-template-columns: 1fr 1fr; } }
  @media (max-width: 560px) { .grid { grid-template-columns: 1fr; } }
</style>
