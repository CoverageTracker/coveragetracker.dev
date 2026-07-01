<script lang="ts">
  let {
    file = '',
    lang = '',
    code,
    highlighted = ''
  }: { file?: string; lang?: string; code: string; highlighted?: string } = $props();

  let copied = $state(false);
  let timer: ReturnType<typeof setTimeout>;

  function copy() {
    navigator.clipboard?.writeText(code);
    copied = true;
    clearTimeout(timer);
    timer = setTimeout(() => (copied = false), 1400);
  }
</script>

<div class="code">
  <div class="code-head">
    <span class="d" style="background:var(--status-fail)"></span>
    <span class="d" style="background:var(--status-warn)"></span>
    <span class="d" style="background:var(--status-pass)"></span>
    {#if file}<span class="fn mono">{file}</span>{/if}
    {#if lang}<span class="lang mono">{lang}</span>{/if}
    <button class="copy mono" class:done={copied} onclick={copy} aria-label="Copy code">
      {#if copied}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
        Copied
      {:else}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
        Copy
      {/if}
    </button>
  </div>
  {#if highlighted}
    <div class="hl">{@html highlighted}</div>
  {:else}
    <pre class="mono">{code}</pre>
  {/if}
</div>

<style>
  .code {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 10px;
    overflow: hidden;
    margin: 0 0 18px;
  }
  .code-head {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 14px;
    border-bottom: 1px solid var(--border);
  }
  .d { width: 10px; height: 10px; border-radius: 50%; }
  .fn { font-size: 11.5px; color: var(--muted); margin-left: 4px; }
  .lang {
    margin-left: 10px;
    font-size: 10px;
    align-self: center;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
  }
  .copy {
    margin-left: auto;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--elevated);
    border: 1px solid var(--border);
    color: var(--muted);
    font-size: 11px;
    border-radius: 6px;
    padding: 3px 9px;
    cursor: pointer;
    transition: all 120ms ease;
  }
  .copy:hover { color: var(--primary); border-color: var(--primary); }
  .copy.done { color: var(--status-pass); border-color: var(--status-pass); }
  .copy svg { width: 13px; height: 13px; }
  pre {
    margin: 0;
    padding: 15px 16px;
    overflow-x: auto;
    font-size: 13px;
    line-height: 1.7;
    color: var(--text);
    white-space: pre;
  }
  /* Shiki-generated <pre> lives inside .hl which is scoped */
  .hl :global(pre.shiki) {
    margin: 0;
    padding: 15px 16px;
    overflow-x: auto;
    font-size: 13px;
    line-height: 1.7;
    white-space: pre;
    font-family: 'JetBrains Mono', ui-monospace, monospace;
    background: var(--card) !important;
  }
  .hl :global(pre.shiki code) {
    font-size: inherit;
    font-family: inherit;
    background: none;
    display: block;
  }
</style>
