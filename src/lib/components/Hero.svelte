<script lang="ts">
  import { onMount } from 'svelte';

  const tools = ['Jest', 'Vitest', 'pytest-cov', 'go test', 'gocyclo', 'gocognit', 'radon', 'lizard', 'jscpd'];

  let toolText = $state('');
  let dots = $state('');
  let fading = $state(false);

  onMount(() => {
    let cancelled = false;
    let idx = 0;
    const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms));

    async function run() {
      while (!cancelled) {
        const tool = tools[idx % tools.length];
        for (let i = 1; i <= tool.length; i++) {
          if (cancelled) return;
          toolText = tool.slice(0, i);
          await sleep(90);
        }
        await sleep(500);
        for (const d of ['.', '..', '...']) {
          if (cancelled) return;
          dots = d;
          await sleep(160);
        }
        await sleep(750);
        fading = true;
        await sleep(280);
        toolText = '';
        dots = '';
        fading = false;
        idx++;
        await sleep(120);
      }
    }

    run();
    return () => { cancelled = true; };
  });
</script>

<header class="hero" id="top">
  <div class="grid-tex" aria-hidden="true"></div>
  <div class="glow g1" aria-hidden="true"></div>
  <div class="glow g2" aria-hidden="true"></div>

  <div class="wrap inner">
    <div class="copy">
      <div class="eyebrow mono">
        <span class="pill"><span class="dot"></span>self-hosted · open source</span>
      </div>
      <h1 class="title mono">Coverage<br /><span class="accent">Tracker</span></h1>
      <p class="lede">
        Self-hosted code coverage and quality tracking for GitHub repositories. Push metrics
        from CI, watch trends over time, and ship status badges — on your own infrastructure.
      </p>
      <div class="cta-row">
        <a class="btn btn-pri" href="https://github.com/CoverageTracker/coverage-tracker" target="_blank" rel="noreferrer">View on GitHub</a>
        <a class="btn btn-sec mono" href="/docs">$ read the docs</a>
      </div>
      <div class="install mono">
        <a class="deploy-btn" href="https://deploy.workers.cloudflare.com/?url=https://github.com/CoverageTracker/coverage-tracker" target="_blank" rel="noreferrer">
          <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M15.5 9a5.5 5.5 0 0 0-10.86-1.1A4 4 0 1 0 4 16h11a3.5 3.5 0 0 0 .5-6.96V9z"/></svg>
          Deploy to Cloudflare
        </a>
        <span class="or">or</span><code>npm run deploy</code>
      </div>
    </div>

    <div class="ring-panel">
      <div class="ring-top">
        <div class="donut mono" aria-hidden="true">
          <div class="track"></div>
          <div class="hole"></div>
          <div class="num"><b>94<i>%</i></b><small>coverage</small></div>
        </div>
        <div class="ring-meta">
          <div class="rm-title mono">acme-labs/coverage-tracker</div>
          <div class="rm-sub">main · last 30 days</div>
          <div class="rm-sub mono delta">▲ +1.2% this week</div>
        </div>
      </div>
      <div class="chips">
        <div class="chip mono"><span class="sq" style="background:var(--chart-0)"></span><span class="k">lines</span><span class="v" style="color:var(--chart-0)">94.2%</span></div>
        <div class="chip mono"><span class="sq" style="background:var(--status-warn)"></span><span class="k">branches</span><span class="v" style="color:var(--status-warn)">88.1%</span></div>
        <div class="chip mono"><span class="sq" style="background:var(--status-alert)"></span><span class="k">duplication</span><span class="v" style="color:var(--status-alert)">1.8%</span></div>
      </div>
    </div>
  </div>

  <div class="strip">
    <div class="wrap strip-inner mono">
      <span>Works with</span>
      <span class="typer" class:fading aria-live="polite" aria-atomic="true">
        {#if toolText}<b>{toolText}</b>{/if}<span class="ellipsis">{dots}</span><span class="cursor" aria-hidden="true"></span>
      </span>
    </div>
  </div>
</header>

<style>
  .hero { position: relative; overflow: hidden; border-bottom: 1px solid var(--border); }
  .grid-tex {
    position: absolute; inset: 0;
    background-image: linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px);
    background-size: 48px 48px; opacity: 0.16; pointer-events: none;
  }
  .glow { position: absolute; border-radius: 50%; filter: blur(8px); pointer-events: none; }
  .g1 { top: -160px; left: -120px; width: 460px; height: 460px; background: radial-gradient(circle, var(--ring), transparent 70%); }
  .g2 { bottom: -160px; right: -140px; width: 560px; height: 560px; background: radial-gradient(circle, color-mix(in srgb, var(--chart-1) 24%, transparent), transparent 70%); }

  .inner { position: relative; display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 48px; align-items: center; padding: 80px 32px 84px; }

  .eyebrow { font-size: 12px; letter-spacing: 0.16em; text-transform: uppercase; color: var(--muted); margin-bottom: 22px; }
  .pill { display: inline-flex; align-items: center; gap: 8px; padding: 5px 12px; border: 1px solid var(--border); border-radius: 999px; background: var(--card); }
  .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--status-pass); box-shadow: 0 0 10px var(--status-pass); }

  .title { font-weight: 800; font-size: 64px; line-height: 1; letter-spacing: -0.02em; margin: 0; }
  .title .accent { color: var(--primary); }
  .lede { font-size: 20px; line-height: 1.55; color: var(--muted); max-width: 520px; margin: 24px 0 32px; }

  .cta-row { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
  .btn {
    display: inline-flex; align-items: center; gap: 8px; height: 42px; padding: 0 18px;
    border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; border: 1px solid transparent;
    transition: all 120ms ease;
  }
  .btn-pri { background: var(--primary); color: var(--primary-fg); }
  .btn-pri:hover { opacity: 0.9; }
  .btn-sec { background: transparent; color: var(--text); border-color: var(--border); }
  .btn-sec:hover { border-color: var(--primary); color: var(--primary); }

  .install { font-size: 13px; color: var(--muted); margin-top: 22px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
  .install code { background: var(--elevated); padding: 6px 11px; border-radius: 6px; color: var(--text); }
  .deploy-btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 6px 13px; border: 1px solid var(--status-pass); border-radius: 7px;
    background: color-mix(in srgb, var(--status-pass) 10%, transparent);
    color: var(--status-pass); font-size: 13px; font-weight: 600;
    transition: background 120ms ease, box-shadow 120ms ease;
  }
  .deploy-btn:hover {
    background: color-mix(in srgb, var(--status-pass) 18%, transparent);
    box-shadow: 0 0 0 3px color-mix(in srgb, var(--status-pass) 30%, transparent);
  }
  .deploy-btn svg { width: 15px; height: 15px; flex-shrink: 0; }
  .or { font-size: 12px; color: var(--muted); }

  /* ring panel */
  .ring-panel { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 28px; display: flex; flex-direction: column; gap: 18px; }
  .ring-top { display: flex; align-items: center; gap: 22px; }
  .donut { position: relative; width: 128px; height: 128px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
  .donut .track { position: absolute; inset: 0; border-radius: 50%; background: conic-gradient(var(--status-pass) 0% 94%, var(--elevated) 94% 100%); }
  .donut .hole { position: absolute; inset: 12px; border-radius: 50%; background: var(--card); border: 1px solid var(--border); }
  .donut .num { position: relative; text-align: center; }
  .donut .num b { font-size: 34px; font-weight: 800; color: var(--status-pass); letter-spacing: -0.02em; }
  .donut .num b i { font-size: 17px; font-style: normal; color: var(--chart-2); }
  .donut .num small { display: block; margin-top: 3px; font-size: 8.5px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--muted); }
  .ring-meta .rm-title { font-size: 13.5px; font-weight: 600; }
  .ring-meta .rm-sub { font-size: 12px; color: var(--muted); margin-top: 3px; }
  .ring-meta .delta { margin-top: 10px; color: var(--status-pass); }

  .chips { display: flex; flex-direction: column; gap: 9px; }
  .chip { display: flex; align-items: center; gap: 11px; padding: 11px 15px; border-radius: 11px; background: var(--bg); border: 1px solid var(--border); }
  .chip .sq { width: 9px; height: 9px; border-radius: 3px; }
  .chip .k { font-size: 13px; font-weight: 600; }
  .chip .v { font-size: 13px; font-weight: 700; margin-left: auto; }

  .strip { position: relative; border-top: 1px solid var(--border); padding: 22px 0; }
  .strip-inner { display: flex; align-items: center; gap: 16px; justify-content: center; font-size: 13px; color: var(--muted); }
  .strip-inner b { color: var(--text); font-weight: 600; }
  .typer { display: inline-flex; align-items: center; width: 16ch; transition: opacity 250ms ease; }
  .typer.fading { opacity: 0; }
  .ellipsis { color: var(--muted); }
  .cursor {
    display: inline-block; width: 8px; height: 1em;
    background: var(--text); margin-left: 2px; vertical-align: text-bottom;
    animation: blink 900ms step-end infinite;
  }
  @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
  @media (prefers-reduced-motion: reduce) { .cursor { animation: none; } .typer { transition: none; } }

  @media (max-width: 880px) {
    .inner { grid-template-columns: 1fr; gap: 36px; padding-top: 56px; }
    .title { font-size: 52px; }
  }
</style>
