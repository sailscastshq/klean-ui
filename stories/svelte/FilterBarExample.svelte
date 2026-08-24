<script>
  import FilterBar from "../../registry/filter-bar/svelte/FilterBar.svelte";

  let {
    label = "Service filters",
    busy = false,
    class: className = "",
  } = $props();
  let filters = $state({ status: "running" });
</script>

<div class="w-[min(48rem,calc(100vw-2rem))]">
  <FilterBar bind:value={filters} {label} {busy} class={className}>
    {#snippet children(filter)}
      <label for="svelte-filter-status" class="sr-only">Status</label>
      <select
        id="svelte-filter-status"
        value={filter.draft.status ?? ""}
        class="min-h-11 cursor-pointer rounded-lg border border-gray-200 bg-white px-3 text-sm dark:border-gray-700 dark:bg-gray-950"
        onchange={(event) => filter.update("status", event.currentTarget.value)}
      >
        <option value="">Any status</option>
        <option value="running">Running</option>
        <option value="stopped">Stopped</option>
      </select>
      <button {...filter.applyProps} class="min-h-11 cursor-pointer rounded-lg bg-gray-950 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-gray-950">Apply</button>
      <button {...filter.cancelProps} class="min-h-11 cursor-pointer rounded-lg px-3 text-sm disabled:cursor-not-allowed disabled:opacity-40">Cancel</button>
      {#each filter.entries as [key, entry] (key)}
        <button {...filter.removeProps(key)} class="min-h-9 cursor-pointer rounded-full bg-gray-100 px-3 text-sm dark:bg-gray-800">{key}: {entry} ×</button>
      {/each}
    {/snippet}
  </FilterBar>
</div>
