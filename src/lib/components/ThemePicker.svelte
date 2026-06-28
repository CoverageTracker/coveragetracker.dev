<script lang="ts">
  import { THEMES, theme, meta, setTheme, toggleMode } from '$lib/theme.svelte';

  let open = $state(false);
  let root: HTMLDivElement;

  const current = $derived(meta(theme.id));
  const canToggle = $derived(current.modes.length > 1);

  function onWindowClick(e: MouseEvent) {
    if (root && !root.contains(e.target as Node)) open = false;
  }

  function pick(id: string) {
    setTheme(id);
    open = false;
  }
</script>

<svelte:window onclick={onWindowClick} />

<div class="picker" bind:this={root}>
  <!-- light/dark toggle -->
  <button
    class="iconbtn"
    onclick={toggleMode}
    disabled={!canToggle}
    title={canToggle ? `Switch to ${theme.mode === 'dark' ? 'light' : 'dark'} mode` : 'This scheme is dark-only'}
    aria-label="Toggle light or dark mode"
  >
    {#if theme.mode === 'dark'}
      <!-- moon -->
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
    {:else}
      <!-- sun -->
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
    {/if}
  </button>

  <!-- scheme dropdown trigger -->
  <button class="trigger mono" onclick={() => (open = !open)} aria-haspopup="listbox" aria-expanded={open}>
    <span class="dots" aria-hidden="true">
      {#each current.swatch as c}<span style="background:{c}"></span>{/each}
    </span>
    <span class="name">{current.label}</span>
    <svg class="chev" class:up={open} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6" /></svg>
  </button>

  {#if open}
    <div class="menu" role="listbox" aria-label="Color scheme">
      <div class="menu-head mono">Color scheme</div>
      {#each THEMES as t}
        <button class="row mono" role="option" aria-selected={t.id === theme.id} onclick={() => pick(t.id)}>
          <span class="dots" aria-hidden="true">
            {#each t.swatch as c}<span style="background:{c}"></span>{/each}
          </span>
          <span class="row-text">
            <span class="row-name">{t.label}</span>
            <span class="row-note">{t.note}</span>
          </span>
          {#if t.id === theme.id}
            <svg class="check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
          {/if}
        </button>
      {/each}
    </div>
  {/if}
</div>

<style>
  .picker { position: relative; display: flex; align-items: center; gap: 8px; }

  .iconbtn {
    display: inline-flex; align-items: center; justify-content: center;
    width: 38px; height: 38px; border-radius: 8px;
    background: transparent; border: 1px solid var(--border); color: var(--muted);
    cursor: pointer; transition: all 120ms ease;
  }
  .iconbtn svg { width: 18px; height: 18px; }
  .iconbtn:hover:not(:disabled) { background: var(--elevated); color: var(--primary); border-color: var(--primary); }
  .iconbtn:disabled { opacity: 0.4; cursor: not-allowed; }

  .trigger {
    display: inline-flex; align-items: center; gap: 10px;
    height: 38px; padding: 0 12px; border-radius: 8px;
    background: var(--card); border: 1px solid var(--border); color: var(--text);
    font-size: 13px; font-weight: 600; cursor: pointer; transition: all 120ms ease;
  }
  .trigger:hover { border-color: var(--primary); }
  .trigger .name { letter-spacing: -0.01em; }
  .chev { width: 15px; height: 15px; color: var(--muted); transition: transform 150ms ease; }
  .chev.up { transform: rotate(180deg); }

  .dots { display: inline-flex; gap: 3px; }
  .dots span { width: 9px; height: 9px; border-radius: 2px; }

  .menu {
    position: absolute; top: calc(100% + 8px); right: 0; z-index: 60;
    width: 244px; padding: 6px;
    background: var(--card); border: 1px solid var(--border); border-radius: 12px;
    box-shadow: 0 16px 44px rgba(0, 0, 0, 0.38);
    animation: drop 140ms ease;
  }
  @keyframes drop { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

  .menu-head {
    font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase;
    color: var(--muted); padding: 8px 10px 6px;
  }
  .row {
    display: flex; align-items: center; gap: 11px; width: 100%;
    padding: 9px 10px; border: 0; border-radius: 8px;
    background: transparent; color: var(--text); text-align: left; cursor: pointer;
    transition: background 120ms ease;
  }
  .row:hover { background: var(--elevated); }
  .row-text { display: flex; flex-direction: column; line-height: 1.25; }
  .row-name { font-size: 13px; font-weight: 600; }
  .row-note { font-size: 11px; color: var(--muted); }
  .check { width: 16px; height: 16px; margin-left: auto; color: var(--primary); }
</style>
