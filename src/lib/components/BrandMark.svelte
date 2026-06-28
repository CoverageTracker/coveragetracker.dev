<script lang="ts">
  let { size = 26 }: { size?: number } = $props();
</script>

<!-- Brand glyph: rounded tile + coverage-trend polyline (design system logo-mark) -->
<svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
  <rect width="32" height="32" rx="6" fill="var(--primary)" />
  <path
    d="M8 22 L12 16 L16 18 L20 10 L24 14"
    stroke="var(--primary-fg)"
    stroke-width="2.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</svg>
