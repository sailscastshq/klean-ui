<script>
  import BulkActions from "../../registry/bulk-actions/svelte/BulkActions.svelte";

  let {
    count = 3,
    label = "Actions for selected services",
    busy = false,
    clearLabel = "Clear selection",
    class: className = "",
  } = $props();
  let selectedCount = $state(0);

  $effect(() => {
    selectedCount = count;
  });
</script>

{#snippet actions()}
  <button
    type="button"
    disabled={busy}
    class="min-h-9 cursor-pointer rounded-md bg-gray-950 px-3 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-950"
  >
    Export
  </button>
{/snippet}

<div class="w-[min(42rem,calc(100vw-2rem))]">
  <label class="mb-3 flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
    <input
      data-bulk-actions-focus
      type="checkbox"
      checked={selectedCount > 0}
      readonly
      class="size-4"
    />
    Select all services on this page
  </label>
  <BulkActions
    count={selectedCount}
    {label}
    {busy}
    {clearLabel}
    class={className}
    onclear={() => (selectedCount = 0)}
    children={actions}
  />
</div>
