<script>
  import RowActions from "../../registry/row-actions/svelte/RowActions.svelte";

  let { label = "Actions for api", busy = false, class: className = "" } = $props();
  let notice = $state("No action yet");
</script>

{#snippet visibleActions()}
  <a href="#logs" class="inline-flex min-h-9 items-center rounded-md px-3 text-sm font-medium text-gray-700 no-underline hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800">Logs</a>
{/snippet}

{#snippet menuActions()}
  <a href="#settings" class="block rounded-sm px-3 py-2 text-sm text-gray-700 no-underline hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800">Settings</a>
  <button type="button" class="block w-full cursor-pointer rounded-sm px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-800" onclick={() => notice = "Redeploy requested"}>Redeploy</button>
  <button type="button" class="block w-full cursor-pointer rounded-sm px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40" onclick={() => notice = "Delete confirmation requested"}>Delete service</button>
{/snippet}

<div class="w-[min(34rem,calc(100vw-2rem))]">
  <div class="flex items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
    <div>
      <a href="#api" class="font-medium text-gray-950 no-underline hover:underline dark:text-white">api</a>
      <p class="mt-1 text-sm text-gray-500">Healthy · fra1</p>
    </div>
    <RowActions {label} {busy} class={className} children={visibleActions} menu={menuActions} />
  </div>
  <p class="mt-3 text-sm text-gray-500" aria-live="polite">{notice}</p>
</div>
