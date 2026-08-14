<script>
  import { Link } from "@inertiajs/svelte";
  import Card from "../../registry/card/svelte/Card.svelte";

  function keepPreview(event) {
    event.preventDefault();
  }
</script>

<Card
  as="article"
  aria-labelledby="svelte-revenue-title"
  class="w-[min(90vw,28rem)] rounded-lg border-2 border-black bg-black p-6 text-white shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] dark:border-white dark:bg-white dark:text-black"
>
  <header class="flex items-start justify-between gap-4">
    <h2
      id="svelte-revenue-title"
      class="text-sm font-medium text-white/60 dark:text-black/60"
    >
      Revenue
    </h2>
    <button
      type="button"
      class="cursor-pointer rounded border border-white/20 px-2.5 py-1 text-xs dark:border-black/20"
    >
      USD ↔
    </button>
  </header>
  <Link
    href="#svelte-paid-invoices"
    onclick={keepPreview}
    class="mt-10 block text-4xl font-bold leading-none tracking-tight text-white no-underline tabular-nums dark:text-black"
  >
    $128,420.00
  </Link>
</Card>
