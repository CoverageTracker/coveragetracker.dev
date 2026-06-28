<script lang="ts">
  import '../app.css';
  import { theme, applyTheme } from '$lib/theme.svelte';

  let { children } = $props();

  // Reflect the store onto <html> + persist whenever it changes.
  $effect(() => {
    // touch reactive fields so the effect re-runs on change
    theme.id;
    theme.mode;
    applyTheme();
  });
</script>

{@render children()}
