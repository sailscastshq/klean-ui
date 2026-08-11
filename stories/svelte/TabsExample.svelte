<script>
  import Tabs from "../../registry/tabs/svelte/Tabs.svelte";

  let {
    initialValue = "overview",
    orientation = "horizontal",
    activation = "automatic",
  } = $props();
  let active = $state();
  const values = ["overview", "activity", "settings"];
  const tabClass = [
    "min-h-11 shrink-0 cursor-pointer border-b-2 border-transparent px-1 py-2 text-sm font-medium text-gray-500 outline-none",
    "hover:text-gray-950 focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2",
    "data-[state=active]:border-gray-950 data-[state=active]:text-gray-950",
    "disabled:cursor-not-allowed disabled:opacity-40 dark:text-gray-400 dark:hover:text-white dark:focus-visible:ring-white dark:data-[state=active]:border-white dark:data-[state=active]:text-white",
  ].join(" ");

  $effect(() => {
    active = initialValue;
  });
</script>

<Tabs
  bind:value={active}
  aria-label="Project sections"
  {orientation}
  {activation}
  class="w-[min(38rem,calc(100vw-2rem))] text-gray-950 dark:text-white"
>
  <div
    class={orientation === "vertical"
      ? "flex w-36 flex-col items-stretch gap-1 border-r border-gray-200 pr-3 dark:border-gray-800"
      : "flex gap-6 overflow-x-auto border-b border-gray-200 dark:border-gray-800"}
  >
    {#each values as item}
      <button
        type="button"
        data-value={item}
        class={`${tabClass} ${orientation === "vertical"
          ? "justify-start border-b-0 border-l-2 px-3 text-left data-[state=active]:border-l-gray-950 dark:data-[state=active]:border-l-white"
          : ""}`}
      >
        {item[0].toUpperCase() + item.slice(1)}
      </button>
    {/each}
  </div>
  <section
    data-value="overview"
    class="min-h-36 py-6 outline-none focus-visible:ring-2"
  >
    <h2 class="text-lg font-semibold">Project overview</h2>
    <p class="mt-2 text-sm leading-6 text-gray-500">
      Health, ownership, and the next deploy in one instant panel.
    </p>
  </section>
  <section
    data-value="activity"
    class="min-h-36 py-6 outline-none focus-visible:ring-2"
  >
    <h2 class="text-lg font-semibold">Recent activity</h2>
    <p class="mt-2 text-sm leading-6 text-gray-500">
      Seven deployments completed this week.
    </p>
  </section>
  <section
    data-value="settings"
    class="min-h-36 py-6 outline-none focus-visible:ring-2"
  >
    <h2 class="text-lg font-semibold">Project settings</h2>
    <p class="mt-2 text-sm leading-6 text-gray-500">
      Configuration remains ordinary application markup.
    </p>
  </section>
</Tabs>
