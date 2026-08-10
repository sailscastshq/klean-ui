<script>
  import Spinner from "../../registry/spinner/svelte/Spinner.svelte";

  let {
    loading = true,
    label = "Loading deployments…",
    class: className = "",
  } = $props();
</script>

<span
  role="status"
  aria-live="polite"
  aria-atomic="true"
  class="inline-flex min-h-6 items-center gap-2 text-sm text-gray-700 dark:text-gray-200"
>
  {#if loading}
    <Spinner class={className} />
    <span>{label}</span>
  {/if}
</span>
