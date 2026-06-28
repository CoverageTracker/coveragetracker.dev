<script lang="ts">
  import Nav from '$lib/components/Nav.svelte';
  import Hero from '$lib/components/Hero.svelte';
  import Features from '$lib/components/Features.svelte';
  import HowItWorks from '$lib/components/HowItWorks.svelte';
  import ThemeShowcase from '$lib/components/ThemeShowcase.svelte';
  import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
  <title>Coverage Tracker — self-hosted coverage & quality tracking</title>
</svelte:head>

<Nav />
<main>
  <Hero />
  <Features />
  <HowItWorks />
  <ThemeShowcase />
</main>
<Footer />
