<script lang="ts">
  export let kicker: string;
  export let title: string;
</script>

<div class="kicker mono">// {kicker}</div>
<h2 class="mono">{title}</h2>
<slot />
