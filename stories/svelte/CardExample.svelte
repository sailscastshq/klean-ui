<script>
  import Card from "../../registry/card/svelte/Card.svelte";

  let {
    as = "article",
    title = "Production API",
    description = "Healthy in Lagos with three replicas.",
  } = $props();
</script>

<Card {as} class="w-[min(88vw,28rem)]">
  <h2 class="text-lg font-semibold">{title}</h2>
  <p class="mt-2 leading-6 text-gray-600 dark:text-gray-300">
    {description}
  </p>
</Card>
