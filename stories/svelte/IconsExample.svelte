<script>
  import { iconComponents, iconEntries } from "./generated/icons.js";

  const Trash = iconComponents.Trash;
  const Rocket = iconComponents.Rocket;

  const groupDefinitions = [
    {
      id: "shared",
      title: "Shared application language",
      entries: iconEntries.filter(
        ({ applications }) => applications.length === 2,
      ),
    },
    {
      id: "hagfish",
      title: "Hagfish application set",
      entries: iconEntries.filter(
        ({ applications }) =>
          applications.length === 1 && applications[0] === "hagfish",
      ),
    },
    {
      id: "slipway",
      title: "Slipway application set",
      entries: iconEntries.filter(
        ({ applications }) =>
          applications.length === 1 && applications[0] === "slipway",
      ),
    },
    {
      id: "signature",
      title: "Klean signature",
      entries: iconEntries.filter(
        ({ applications }) => applications.length === 0,
      ),
    },
  ];

  let {
    mode = "playground",
    icon = "Rocket",
    size = 24,
    color = "#111827",
    strokeWidth = 1.5,
  } = $props();
</script>

{#if mode === "playground"}
  {@const Icon = iconComponents[icon]}
  <div
    class="grid min-h-44 min-w-72 place-items-center rounded-3xl bg-gray-50 p-10 shadow-sm dark:bg-gray-950"
  >
    <Icon
      style={`color: ${color}; font-size: ${size}px`}
      stroke-width={strokeWidth}
    />
  </div>
{:else if mode === "apps"}
  <main
    class="klean-story-canvas min-h-screen px-5 py-14 sm:px-8 lg:px-12 lg:py-20"
  >
    <h1
      class="text-balance text-4xl font-semibold tracking-tighter sm:text-5xl"
    >
      Native Svelte source. Product-owned expression.
    </h1>
    <div class="mt-12 grid max-w-5xl gap-10 lg:grid-cols-2">
      <section
        class="rounded-xl border-2 border-black bg-white p-6 shadow-[4px_4px_0_0_#000] dark:border-white dark:bg-gray-950 dark:shadow-[4px_4px_0_0_#fff]"
      >
        <h2 class="font-semibold">Invoice actions</h2>
        <button
          type="button"
          class="mt-5 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border-2 border-red-600 px-4 text-sm font-medium text-red-600"
          ><Trash class="size-4" />Delete</button
        >
      </section>
      <section
        class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-950 dark:ring-white/10"
      >
        <h2 class="font-semibold">Deployment</h2>
        <p
          class="mt-5 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
        >
          <Rocket class="size-5" />Ready to launch
        </p>
      </section>
    </div>
  </main>
{:else}
  <main
    class="klean-story-canvas min-h-screen px-5 py-14 sm:px-8 lg:px-12 lg:py-20"
  >
    <header class="max-w-3xl">
      <h1
        class="text-balance text-4xl font-semibold tracking-tighter sm:text-5xl"
      >
        The application vocabulary in native Svelte.
      </h1>
      <p
        class="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted"
      >
        Ninety-seven audited product concepts and Klean's redesigned Rocket,
        delivered as ordinary rune-era SVG components.
      </p>
    </header>
    {#each groupDefinitions as group}
      <section class="mt-14 max-w-screen-2xl">
        <div class="flex items-baseline gap-4">
          <h2 class="text-2xl font-semibold tracking-tight">{group.title}</h2>
          <span class="text-sm tabular-nums text-klean-muted"
            >{group.entries.length} icons</span
          >
        </div>
        <ul
          class="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8"
        >
          {#each group.entries as entry}
            {@const Icon = entry.component}
            <li
              title={entry.description}
              class="grid min-w-0 justify-items-center gap-3 rounded-2xl bg-white px-3 py-5 text-center shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-950 dark:ring-white/10"
            >
              <Icon class="size-6" />
              <p class="w-full truncate text-xs font-medium">{entry.name}</p>
            </li>
          {/each}
        </ul>
      </section>
    {/each}
  </main>
{/if}
