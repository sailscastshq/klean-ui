<script>
  import Spinner from "../../registry/spinner/svelte/Spinner.svelte";
  import ProductLoader from "./ProductLoader.svelte";
</script>

<span role="status" class="inline-flex items-center gap-2 text-sm">
  <Spinner class="size-6 text-gray-950 dark:text-white">
    <ProductLoader />
  </Spinner>
  Loading with an application-owned mark…
</span>
