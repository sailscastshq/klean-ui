<script>
  import Badge from "../../registry/badge/svelte/Badge.svelte";
</script>

<div class="flex items-center gap-8">
  <Badge class="bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
    <span aria-hidden="true" class="size-1.5 rounded-full bg-emerald-500"></span>
    Healthy
  </Badge>
  <button
    type="button"
    aria-label="Notifications, 3 unread"
    class="relative size-11 cursor-pointer rounded-full bg-gray-950 text-white dark:bg-white dark:text-gray-950"
  >
    <span aria-hidden="true">◎</span>
    <Badge
      aria-hidden="true"
      class="absolute -right-1 -top-1 min-w-5 justify-center border-white bg-red-600 px-1 text-[10px] text-white dark:border-gray-950 dark:bg-red-500"
    >3</Badge>
  </button>
</div>
