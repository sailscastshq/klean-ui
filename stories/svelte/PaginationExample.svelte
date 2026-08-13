<script>
  import Pagination from "../../registry/pagination/svelte/Pagination.svelte";

  let { page = 4, pages = 12 } = $props();
  let current = $state(4);

  $effect(() => {
    current = page;
  });

  function navigate(event) {
    const link = event.target.closest?.("a[data-page]");
    if (!link) return;
    event.preventDefault();
    current = Number(link.dataset.page);
  }
</script>

<div class="w-[min(92vw,46rem)]" onclickcapture={navigate}>
  <Pagination page={current} {pages} />
</div>
