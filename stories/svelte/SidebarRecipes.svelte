<script>
  import Sidebar from "../../registry/sidebar/svelte/Sidebar.svelte";

  const links = ["Projects", "Deployments", "Lookout", "Settings"];
</script>

<div
  class="flex min-h-152 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950"
>
  <Sidebar
    id="svelte-slipway-sidebar"
    remember={false}
    aria-label="Slipway navigation"
    class="w-60 border-r border-gray-200 bg-gray-50 data-[state=closed]:w-0 dark:border-gray-800 dark:bg-gray-950"
  >
    {#snippet children()}
      <div class="flex h-full w-60 flex-col">
        <header class="flex min-h-16 items-center gap-3 px-4">
          <span
            class="grid size-8 place-items-center rounded-lg bg-gray-950 text-xs font-bold text-white dark:bg-white dark:text-gray-950"
            >S</span
          >
          <strong class="text-sm">Slipway Labs</strong>
        </header>
        <nav aria-label="Workspace" class="flex-1 px-3 py-3">
          <ul class="grid gap-1 text-sm">
            {#each links as label}
              <li>
                <a
                  href={`#${label.toLowerCase()}`}
                  aria-current={label === "Projects" ? "page" : undefined}
                  class={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 no-underline ${
                    label === "Projects"
                      ? "bg-gray-200 font-medium dark:bg-gray-800"
                      : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-900"
                  }`}
                  ><span aria-hidden="true" class="text-xs">◫</span
                  >{label}</a
                >
              </li>
            {/each}
          </ul>
        </nav>
      </div>
    {/snippet}
  </Sidebar>

  <main class="min-w-0 flex-1 p-8">
    <p class="text-sm text-gray-500">Projects / Sailscasts API</p>
    <h1 class="mt-3 text-3xl font-semibold tracking-tight">Services</h1>
    <div class="mt-8 grid gap-4 sm:grid-cols-2">
      {#each ["web", "worker"] as service}
        <article
          class="rounded-xl border border-gray-200 p-5 dark:border-gray-800"
        >
          <div class="flex items-center justify-between">
            <h2 class="font-medium">{service}</h2>
            <span class="size-2 rounded-full bg-emerald-500"
              ><span class="sr-only">Running</span></span
            >
          </div>
          <p class="mt-5 font-mono text-xs text-gray-500">
            fra · node 24 · main
          </p>
        </article>
      {/each}
    </div>
  </main>
</div>
