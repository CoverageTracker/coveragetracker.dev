<script lang="ts">
  import { THEMES, theme, meta, setTheme, toggleMode } from '$lib/theme.svelte';

  const current = $derived(meta(theme.id));
  const canToggle = $derived(current.modes.length > 1);

  // a static 30-day-ish coverage series for the preview sparkline
  const pts = [62, 64, 63, 68, 71, 70, 74, 79, 81, 80, 85, 88, 90, 89, 92, 94];
  const W = 320;
  const H = 84;
  const max = 100;
  const min = 50;
  const path = $derived(
    pts
      .map((v, i) => {
        const x = (i / (pts.length - 1)) * W;
        const y = H - ((v - min) / (max - min)) * H;
        return `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ')
  );
  const area = $derived(`${path} L${W} ${H} L0 ${H} Z`);
</script>

<section class="block" id="themes">
  <div class="wrap">
    <div class="sec-eyebrow mono">// make it yours</div>
    <h2 class="sec-title mono">It looks like your editor</h2>
    <p class="sec-lede">
      The whole UI re-themes from a single token swap — this entire page included. Pick a
      colorscheme and watch the charts, badges and surfaces follow.
    </p>

    <div class="layout">
      <!-- interactive scheme grid -->
      <div class="theme-grid">
        {#each THEMES as t}
          <button
            class="tcard mono"
            class:active={t.id === theme.id}
            onclick={() => setTheme(t.id)}
            aria-pressed={t.id === theme.id}
          >
            <span class="tbar">
              {#each t.swatch as c}<span style="background:{c}"></span>{/each}
            </span>
            <span class="tcap">
              <span class="tn">{t.label}</span>
              <span class="tv">{t.note}</span>
            </span>
            {#if t.id === theme.id}
              <span class="badge">active</span>
            {/if}
          </button>
        {/each}
      </div>

      <!-- live preview that reflects the active theme -->
      <div class="preview">
        <div class="pv-head">
          <span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>
          <span class="pv-title mono">dashboard preview</span>
          <button class="modebtn mono" onclick={toggleMode} disabled={!canToggle}>
            {theme.mode === 'dark' ? 'dark' : 'light'}
          </button>
        </div>
        <div class="pv-body">
          <div class="pv-row">
            <div>
              <div class="pv-repo mono">acme-labs/coverage-tracker</div>
              <div class="pv-sub mono">main · coverage</div>
            </div>
            <div class="pv-val mono">94.2%</div>
          </div>
          <svg class="spark" viewBox="0 0 {W} {H}" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--chart-0)" stop-opacity="0.28" />
                <stop offset="100%" stop-color="var(--chart-0)" stop-opacity="0" />
              </linearGradient>
            </defs>
            <path d={area} fill="url(#fill)" />
            <path d={path} fill="none" stroke="var(--chart-0)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
          <div class="pv-chips">
            <span class="pv-chip mono"><i style="background:var(--chart-0)"></i>coverage 94.2%</span>
            <span class="pv-chip mono"><i style="background:var(--chart-1)"></i>complexity 12</span>
            <span class="pv-chip mono"><i style="background:var(--chart-2)"></i>duplication 1.8%</span>
          </div>
          <div class="pv-badge mono">
            <span class="l">coverage</span><span class="r">94%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .block { padding: 84px 0; border-bottom: 1px solid var(--border); }
  .sec-eyebrow { font-size: 12px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--primary); margin-bottom: 14px; }
  .sec-title { font-size: 34px; font-weight: 700; letter-spacing: -0.01em; margin: 0 0 16px; }
  .sec-lede { font-size: 17px; color: var(--muted); max-width: 600px; line-height: 1.55; margin: 0 0 44px; }

  .layout { display: grid; grid-template-columns: 1.1fr 0.9fr; gap: 28px; align-items: start; }

  .theme-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
  .tcard {
    position: relative; text-align: left; cursor: pointer; padding: 0; overflow: hidden;
    border: 1px solid var(--border); border-radius: 11px; background: var(--card);
    transition: border-color 120ms ease, box-shadow 120ms ease;
  }
  .tcard:hover { border-color: var(--primary); }
  .tcard.active { border-color: var(--primary); box-shadow: 0 0 0 3px var(--ring); }
  .tbar { display: flex; height: 46px; }
  .tbar span { flex: 1; }
  .tcap { display: block; padding: 9px 12px; }
  .tcap .tn { display: block; font-size: 12px; font-weight: 600; color: var(--text); }
  .tcap .tv { display: block; font-size: 10px; color: var(--muted); margin-top: 1px; }
  .badge {
    position: absolute; top: 8px; right: 8px; font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase;
    padding: 3px 7px; border-radius: 999px; background: var(--primary); color: var(--primary-fg); font-weight: 700;
  }

  /* preview panel */
  .preview { border: 1px solid var(--border); border-radius: 12px; background: var(--card); overflow: hidden; }
  .pv-head { display: flex; align-items: center; gap: 10px; padding: 11px 14px; border-bottom: 1px solid var(--border); }
  .dots { display: inline-flex; gap: 6px; }
  .dots i { width: 10px; height: 10px; border-radius: 50%; }
  .dots i:nth-child(1) { background: var(--status-fail); }
  .dots i:nth-child(2) { background: var(--status-warn); }
  .dots i:nth-child(3) { background: var(--status-pass); }
  .pv-title { font-size: 12px; color: var(--muted); }
  .modebtn {
    margin-left: auto; font-size: 11px; color: var(--muted); cursor: pointer;
    background: var(--elevated); border: 1px solid var(--border); border-radius: 6px; padding: 3px 9px;
    transition: all 120ms ease;
  }
  .modebtn:hover:not(:disabled) { color: var(--primary); border-color: var(--primary); }
  .modebtn:disabled { opacity: 0.4; cursor: not-allowed; }

  .pv-body { padding: 18px; }
  .pv-row { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 14px; }
  .pv-repo { font-size: 13px; font-weight: 600; }
  .pv-sub { font-size: 11px; color: var(--muted); margin-top: 3px; }
  .pv-val { font-size: 24px; font-weight: 800; color: var(--chart-0); letter-spacing: -0.02em; }
  .spark { width: 100%; height: 84px; display: block; }
  .pv-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
  .pv-chip { display: inline-flex; align-items: center; gap: 7px; font-size: 11px; color: var(--muted); background: var(--bg); border: 1px solid var(--border); border-radius: 999px; padding: 4px 10px; }
  .pv-chip i { width: 8px; height: 8px; border-radius: 2px; }
  .pv-badge { display: inline-flex; height: 22px; border-radius: 4px; overflow: hidden; font-size: 12px; margin-top: 16px; }
  .pv-badge .l { display: flex; align-items: center; padding: 0 9px; background: #3c3c43; color: #fff; }
  .pv-badge .r { display: flex; align-items: center; padding: 0 9px; background: var(--status-pass); color: #13231a; font-weight: 700; }

  @media (max-width: 880px) { .layout { grid-template-columns: 1fr; } }
</style>
