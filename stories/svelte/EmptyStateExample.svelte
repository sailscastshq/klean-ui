<script>
  import EmptyState from "../../registry/empty-state/svelte/EmptyState.svelte";

  let {
    as = "section",
    title = "No projects yet",
    description = "Create your first project to deploy an application.",
  } = $props();
</script>

<EmptyState
  {as}
  aria-labelledby="svelte-empty-title"
  class="w-[min(42rem,calc(100vw-2rem))] rounded-lg border border-gray-200 dark:border-gray-800"
>
  <span
    aria-hidden="true"
    class="grid size-12 place-items-center rounded-lg bg-gray-100 text-2xl dark:bg-gray-800"
  >
    ＋
  </span>
  <div class="max-w-md">
    <h2 id="svelte-empty-title" class="text-lg font-semibold">{title}</h2>
    <p class="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
      {description}
    </p>
  </div>
  <a
    href="#svelte-create-project"
    class="inline-flex min-h-10 items-center rounded-md bg-gray-950 px-4 text-sm font-medium text-white no-underline hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200 dark:focus-visible:outline-white"
  >
    Create project
  </a>
</EmptyState>
