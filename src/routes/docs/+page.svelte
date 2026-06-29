<script lang="ts">
  import Nav from '$lib/components/Nav.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import DocsSidebar from '$lib/components/docs/DocsSidebar.svelte';
  import DocsContent from '$lib/components/docs/DocsContent.svelte';
</script>

<svelte:head>
  <title>Coverage Tracker — Documentation</title>
  <meta
    name="description"
    content="Deploy Coverage Tracker to your own Cloudflare account, install the GitHub App, and push metrics from CI."
  />
</svelte:head>

<Nav />

<header class="docs-head">
  <div class="grid-tex" aria-hidden="true"></div>
  <div class="glow g1" aria-hidden="true"></div>
  <div class="wrap docs-head-inner">
    <div class="crumb mono">
      <a href="/">Home</a><span class="sep">›</span><span>Documentation</span>
    </div>
    <h1 class="mono">Documentation</h1>
    <p>
      Everything you need to deploy Coverage Tracker to your own Cloudflare account, install the
      GitHub App, and start pushing metrics from CI.
    </p>
  </div>
</header>

<div class="wrap">
  <div class="docs">
    <DocsSidebar />
    <DocsContent />
  </div>
</div>

<Footer />

<style>
  .docs-head { position: relative; overflow: hidden; border-bottom: 1px solid var(--border); }
  .grid-tex {
    position: absolute; inset: 0; pointer-events: none; opacity: 0.16;
    background-image: linear-gradient(var(--border) 1px, transparent 1px),
      linear-gradient(90deg, var(--border) 1px, transparent 1px);
    background-size: 48px 48px;
  }
  .glow { position: absolute; border-radius: 50%; filter: blur(8px); pointer-events: none; }
  .g1 { top: -180px; left: -120px; width: 420px; height: 420px; background: radial-gradient(circle, var(--ring), transparent 70%); }

  .docs-head-inner { position: relative; padding: 46px 0 40px; }
  .crumb { font-size: 12px; color: var(--muted); display: flex; align-items: center; gap: 8px; margin-bottom: 16px; }
  .crumb a { transition: color 120ms ease; }
  .crumb a:hover { color: var(--text); }
  .crumb .sep { opacity: 0.7; }
  .docs-head h1 { font-weight: 800; font-size: 40px; letter-spacing: -0.02em; margin: 0 0 12px; }
  .docs-head p { font-size: 17px; color: var(--muted); line-height: 1.55; max-width: 620px; margin: 0; }

  .docs { display: grid; grid-template-columns: 236px 1fr; gap: 48px; align-items: start; padding: 40px 0 80px; }

  @media (max-width: 900px) {
    .docs { grid-template-columns: 1fr; gap: 0; }
    .docs-head h1 { font-size: 32px; }
  }
</style>
