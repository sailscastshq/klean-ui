<script>
  import Bell from "../../registry/icon-bell/svelte/Bell.svelte";
  import Calendar from "../../registry/icon-calendar/svelte/Calendar.svelte";
  import CheckCircle from "../../registry/icon-check-circle/svelte/CheckCircle.svelte";
  import ChevronRight from "../../registry/icon-chevron-right/svelte/ChevronRight.svelte";
  import Copy from "../../registry/icon-copy/svelte/Copy.svelte";
  import Folder from "../../registry/icon-folder/svelte/Folder.svelte";
  import Rocket from "../../registry/icon-rocket/svelte/Rocket.svelte";
  import Search from "../../registry/icon-search/svelte/Search.svelte";
  import Server from "../../registry/icon-server/svelte/Server.svelte";
  import Trash from "../../registry/icon-trash/svelte/Trash.svelte";
  import User from "../../registry/icon-user/svelte/User.svelte";
  import X from "../../registry/icon-x/svelte/X.svelte";

  const iconComponents = {
    Trash,
    Search,
    Calendar,
    CheckCircle,
    X,
    ChevronRight,
    Copy,
    User,
    Folder,
    Server,
    Bell,
    Rocket,
  };

  const iconEntries = Object.entries(iconComponents);

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
        Twelve marks. One quiet voice.
      </h1>
      <p
        class="mt-5 max-w-2xl text-pretty text-base leading-7 text-klean-muted"
      >
        Svelte receives ordinary rune-era source with the same Klean geometry
        and caller-owned visual surface.
      </p>
    </header>
    <ul
      class="mt-12 grid max-w-7xl grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-3 lg:grid-cols-6"
    >
      {#each iconEntries as [name, component]}
        {@const Icon = component}
        <li class="space-y-3">
          <div
            class="grid aspect-square max-w-32 place-items-center rounded-3xl bg-white text-gray-950 shadow-sm ring-1 ring-gray-950/5 dark:bg-gray-950 dark:text-white dark:ring-white/10"
          >
            <Icon class="size-6" />
          </div>
          <p class="text-sm font-medium">{name}</p>
        </li>
      {/each}
    </ul>
  </main>
{/if}
