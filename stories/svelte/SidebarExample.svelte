<script>
  import Sidebar from "../../registry/sidebar/svelte/Sidebar.svelte";

  let {
    defaultOpen = true,
    remember = false,
    class: className =
      "w-64 data-[state=closed]:w-0 data-[state=closed]:opacity-0",
  } = $props();

  let sidebar;
  let open = $state();
  const links = ["Projects", "Deployments", "Lookout", "Settings"];
</script>

<div
  class="flex min-h-136 overflow-hidden bg-white text-gray-950 dark:bg-gray-950 dark:text-white"
>
  <Sidebar
    bind:this={sidebar}
    bind:open
    id="svelte-playground-sidebar"
    {defaultOpen}
    {remember}
    aria-label="Project navigation"
    class={`border-r border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950 ${className}`}
  >
    {#snippet children()}
      <div class="flex h-full w-64 flex-col">
        <div class="flex min-h-16 items-center gap-3 px-4">
          <span
            class="grid size-8 place-items-center rounded-lg bg-gray-950 text-xs font-semibold text-white dark:bg-white dark:text-gray-950"
            >K</span
          >
          <strong class="text-sm">Klean workspace</strong>
        </div>
        <nav aria-label="Workspace" class="flex-1 px-3 py-3">
          <ul class="grid gap-1 text-sm">
            {#each links as label}
              <li>
                <a
                  href={`#${label.toLowerCase()}`}
                  aria-current={label === "Projects" ? "page" : undefined}
                  class={`flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 no-underline transition-colors ${
                    label === "Projects"
                      ? "bg-gray-200 font-medium text-gray-950 dark:bg-gray-800 dark:text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white"
                  }`}
                >
                  <span aria-hidden="true" class="text-xs">◫</span>
                  {label}
                </a>
              </li>
            {/each}
          </ul>
        </nav>
      </div>
    {/snippet}
  </Sidebar>

  <main class="min-w-0 flex-1 px-5 py-8 sm:px-8">
    <button
      type="button"
      aria-controls="svelte-playground-sidebar"
      aria-expanded={Boolean(open)}
      class="inline-flex min-h-11 cursor-pointer items-center rounded-lg bg-gray-950 px-4 text-sm font-medium text-white hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200 dark:focus-visible:outline-white"
      onclick={() => sidebar?.toggle()}
    >
      {open ? "Hide navigation" : "Show navigation"}
    </button>
    <h1 class="mt-12 text-4xl font-semibold tracking-[-0.04em]">
      Current Svelte source. The same contract.
    </h1>
    <p
      class="mt-4 max-w-xl text-sm leading-6 text-gray-600 dark:text-gray-400"
    >
      Bind the state when the shell needs it. The navigation remains native
      markup.
    </p>
  </main>
</div>
