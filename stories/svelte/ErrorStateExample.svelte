<script>
  import ErrorState from "../../registry/error-state/svelte/ErrorState.svelte";

  let {
    as = "section",
    title = "Services could not load",
    description = "Slipway could not reach the deployment service.",
  } = $props();
</script>

<ErrorState
  {as}
  role="alert"
  aria-labelledby="svelte-error-title"
  class="w-[min(42rem,calc(100vw-2rem))] rounded-lg border border-red-200 bg-red-50 dark:border-red-900/50 dark:bg-red-950/20"
>
  <span
    aria-hidden="true"
    class="grid size-12 place-items-center rounded-full bg-red-100 text-xl text-red-700 dark:bg-red-900/40 dark:text-red-300"
  >
    !
  </span>
  <div class="max-w-md">
    <h2 id="svelte-error-title" class="text-lg font-semibold">{title}</h2>
    <p class="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
      {description}
    </p>
  </div>
  <button
    type="button"
    class="min-h-10 cursor-pointer rounded-md bg-gray-950 px-4 text-sm font-medium text-white hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200 dark:focus-visible:outline-white"
  >
    Try again
  </button>
</ErrorState>
