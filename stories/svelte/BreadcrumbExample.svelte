<script>
  import Breadcrumb from "../../registry/breadcrumb/svelte/Breadcrumb.svelte";

  let { items = [] } = $props();

  function stopNavigation(event) {
    if (event.target.closest?.("a")) event.preventDefault();
  }
</script>

<div class="w-[min(90vw,48rem)]" onclickcapture={stopNavigation}>
  <Breadcrumb {items} />
</div>
