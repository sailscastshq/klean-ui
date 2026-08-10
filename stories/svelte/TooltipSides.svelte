<script>
  import Tooltip from "../../registry/tooltip/svelte/Tooltip.svelte";

  const sides = ["top", "right", "bottom", "left"];
</script>

<div class="grid grid-cols-2 gap-24">
  {#each sides as placement}
    <Tooltip text={placement[0].toUpperCase() + placement.slice(1)} {placement}>
      <button
        type="button"
        aria-label={`${placement} tooltip`}
        class="grid size-12 place-items-center rounded-full border border-gray-300 bg-white text-sm font-semibold uppercase text-gray-950"
      >
        {placement[0]}
      </button>
    </Tooltip>
  {/each}
</div>
