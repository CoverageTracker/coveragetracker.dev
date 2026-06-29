<script lang="ts">
  const steps = [
    {
      num: '01',
      title: 'Install the GitHub App',
      body: 'Grant access to the repos you want to track. Coverage Tracker registers each project and its default branch automatically.'
    },
    {
      num: '02',
      title: 'Add the reporting Action',
      body: 'Drop the reporting Action into your workflow. It reads Go, Python, or JavaScript coverage artifacts, collects complexity and duplication, and posts everything to your Worker with a GitHub Actions OIDC token — no static secret required.'
    },
    {
      num: '03',
      title: 'Watch the trend',
      body: 'Open the dashboard for a per-metric, per-branch trend chart, then generate a status badge for your README.'
    }
  ];
</script>

<section class="block" id="how">
  <div class="wrap">
    <div class="sec-eyebrow mono">// from zero to trend</div>
    <h2 class="sec-title mono">Three steps to live coverage</h2>
    <p class="sec-lede">Deploy the Worker and D1 database to your Cloudflare account once — then adding any repo to coverage tracking takes three steps.</p>

    <div class="steps">
      {#each steps as s}
        <div class="step">
          <span class="num mono">{s.num}</span>
          <h3 class="mono">{s.title}</h3>
          <p>
            {s.body}
            {#if s.code}<br /><code class="mono">{s.code}</code>{/if}
          </p>
        </div>
      {/each}
    </div>
  </div>
</section>

<style>
  .block { padding: 84px 0; border-bottom: 1px solid var(--border); }
  .sec-eyebrow { font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--primary); margin-bottom: 14px; }
  .sec-title { font-size: 34px; font-weight: 700; letter-spacing: -0.01em; margin: 0 0 16px; }
  .sec-lede { font-size: 17px; color: var(--muted); max-width: 600px; line-height: 1.55; margin: 0 0 44px; }

  .steps { display: grid; grid-template-columns: repeat(3, 1fr); gap: 22px; }
  .step { position: relative; }
  .num { font-size: 13px; font-weight: 700; color: var(--primary); border-top: 2px solid var(--primary); padding-top: 14px; display: inline-block; }
  .step h3 { font-size: 17px; font-weight: 600; margin: 14px 0 8px; }
  .step p { font-size: 13.5px; line-height: 1.6; color: var(--muted); margin: 0; }
  .step code { display: inline-block; margin-top: 8px; font-size: 12px; background: var(--elevated); padding: 4px 8px; border-radius: 5px; color: var(--text); }

  @media (max-width: 760px) { .steps { grid-template-columns: 1fr; gap: 28px; } }
</style>
