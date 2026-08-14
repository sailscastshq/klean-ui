<script>
  import { Link } from "@inertiajs/svelte";
  import Card from "../../registry/card/svelte/Card.svelte";

  function keepPreview(event) {
    event.preventDefault();
  }
</script>

<div class="grid w-[min(90vw,46rem)] gap-4 sm:grid-cols-2">
  <Card
    as="a"
    href="#native-svelte-card"
    onclick={keepPreview}
    class="block cursor-pointer no-underline transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 dark:hover:bg-gray-900 dark:focus-visible:outline-white"
  >
    <h2 class="font-semibold">Native anchor</h2>
    <p class="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
      Browser navigation remains browser navigation.
    </p>
  </Card>

  <Card
    as={Link}
    href="#inertia-svelte-card"
    onclick={keepPreview}
    class="block cursor-pointer no-underline transition-colors hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 dark:hover:bg-gray-900 dark:focus-visible:outline-white"
  >
    <h2 class="font-semibold">Boring Stack Link</h2>
    <p class="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
      Pass Svelte's Inertia Link directly through <code>as</code>.
    </p>
  </Card>
</div>
