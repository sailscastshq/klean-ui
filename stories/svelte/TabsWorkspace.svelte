<script>
  import Tabs from "../../registry/tabs/svelte/Tabs.svelte";

  let active = $state("customers");
  let openTabs = $state(["schema.sql", "customers", "invoices", "deploys"]);
</script>

<Tabs
  bind:value={active}
  aria-label="Open workspace results"
  class="relative w-[min(46rem,calc(100vw-2rem))] border border-gray-300 bg-white shadow-[5px_5px_0_#111] dark:border-gray-700 dark:bg-gray-950 dark:shadow-[5px_5px_0_#fff]"
>
  <div
    class="flex max-w-full overflow-x-auto border-b border-gray-300 dark:border-gray-700"
  >
    {#each openTabs as label (label)}
      <button
        type="button"
        data-value={label}
        class="min-h-11 w-36 shrink-0 truncate border-r border-gray-300 px-4 pr-10 text-left font-mono text-xs text-gray-600 outline-none focus-visible:ring-2 focus-visible:ring-inset data-[state=active]:bg-gray-950 data-[state=active]:text-white dark:border-gray-700 dark:text-gray-400 dark:data-[state=active]:bg-white dark:data-[state=active]:text-gray-950"
      >{label}</button>
    {/each}
  </div>
  <div class="pointer-events-none absolute left-0 top-0 flex">
    {#each openTabs as label (label)}
      <span
        class="flex min-h-11 w-36 shrink-0 items-center justify-end pr-1"
      >
        <button
          type="button"
          aria-label={`Close ${label}`}
          class={`pointer-events-auto grid size-9 place-items-center outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-red-600 ${active ===
          label
            ? "text-gray-300 hover:text-white dark:text-gray-600 dark:hover:text-black"
            : "text-gray-600 hover:bg-red-50 hover:text-red-700 dark:text-gray-400 dark:hover:bg-red-950/30"}`}
          onclick={() =>
            (openTabs = openTabs.filter((item) => item !== label))}
        >×</button>
      </span>
    {/each}
  </div>
  {#each openTabs as label (label)}
    <div
      data-value={label}
      class="min-h-48 p-6 font-mono text-sm outline-none focus-visible:ring-2 focus-visible:ring-inset"
    >
      {label}
    </div>
  {/each}
</Tabs>
