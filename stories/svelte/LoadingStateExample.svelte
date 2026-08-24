<script>
  import LoadingState from "../../registry/loading-state/svelte/LoadingState.svelte";
  import Spinner from "../../registry/spinner/svelte/Spinner.svelte";

  let {
    label = "Loading services…",
    class: className = "",
  } = $props();
</script>

<section
  aria-busy="true"
  aria-labelledby="svelte-loading-title"
  class="w-[min(42rem,calc(100vw-2rem))]"
>
  <h2 id="svelte-loading-title" class="sr-only">Services</h2>
  <LoadingState class={className}>
    <Spinner class="size-6" />
    <span>{label}</span>
  </LoadingState>
</section>
