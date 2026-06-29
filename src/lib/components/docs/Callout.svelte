<script lang="ts">
  let {
    variant = 'note',
    title,
    children
  }: { variant?: 'note' | 'warn'; title: string; children?: import('svelte').Snippet } = $props();
</script>

<div class="note {variant}">
  <div class="body">
    <div class="nh mono">{title}</div>
    <p>{@render children?.()}</p>
  </div>
</div>

<style>
  .note {
    display: flex;
    gap: 13px;
    border: 1px solid var(--border);
    border-left: 3px solid var(--primary);
    background: var(--accent-fill);
    border-radius: 9px;
    padding: 14px 16px;
    margin: 0 0 18px;
  }
  .note.warn {
    border-left-color: var(--status-alert);
    background: color-mix(in srgb, var(--status-alert) 12%, transparent);
  }
  .nh {
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--primary);
    margin: 0 0 5px;
    font-weight: 700;
  }
  .note.warn .nh { color: var(--status-alert); }
  .body { min-width: 0; }
  .note p { margin: 0; font-size: 14px; line-height: 1.6; color: var(--text); }
  .note :global(code) {
    font-family: var(--font-mono);
    font-size: 0.86em;
    background: var(--elevated);
    color: var(--text);
    padding: 2px 6px;
    border-radius: 5px;
  }
</style>
