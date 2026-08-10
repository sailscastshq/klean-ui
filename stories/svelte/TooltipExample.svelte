<script>
  import Tooltip from "../../registry/tooltip/svelte/Tooltip.svelte";

  let {
    text = "Re-run query",
    placement = "top",
    class: className = "",
  } = $props();
</script>

<Tooltip {text} {placement} class={className}>
  <button
    type="button"
    aria-label="Re-run query"
    class="grid size-10 place-items-center rounded-md bg-gray-950 text-white focus-visible:outline-2 focus-visible:outline-offset-2 dark:bg-white dark:text-gray-950"
  >
    <svg
      viewBox="0 0 24 24"
      class="size-4"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      aria-hidden="true"
    >
      <path
        d="M20 11a8 8 0 1 0-2.34 5.66M20 4v7h-7"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </button>
</Tooltip>
