<script>
  import Alert from "../../registry/alert/svelte/Alert.svelte";
</script>

<Alert
  as="section"
  role="note"
  aria-labelledby="svelte-checklist-title"
  class="max-w-2xl border border-amber-200 bg-amber-50/50 p-0 text-gray-950 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-white"
>
  <header class="px-4 py-3">
    <h2
      id="svelte-checklist-title"
      class="text-sm font-medium text-amber-900 dark:text-amber-200"
    >
      Deployment checklist
    </h2>
  </header>
  <ul class="border-t border-amber-200/60 dark:border-amber-900/40">
    <li class="flex items-center justify-between gap-4 px-4 py-3">
      <span>SESSION_SECRET is missing</span>
      <button type="button" class="cursor-pointer font-medium underline">
        Generate
      </button>
    </li>
  </ul>
</Alert>
