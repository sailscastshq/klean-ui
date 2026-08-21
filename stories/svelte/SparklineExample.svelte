<script>
  import Sparkline from "../../registry/sparkline/svelte/Sparkline.svelte";

  let { label = "", class: className = "" } = $props();

  const activity = [
    { label: "12:00", value: 12 },
    { label: "12:10", value: 18 },
    { label: "12:20", value: 15 },
    { label: "12:30", value: 32 },
    { label: "12:40", value: 28 },
    { label: "12:50", value: 44 },
    { label: "13:00", value: 36 },
  ];
</script>

<div class="flex items-end gap-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-950">
  <div>
    <p class="text-xs text-gray-500 dark:text-gray-400">Requests</p>
    <p class="mt-1 text-3xl font-semibold tabular-nums">2,418</p>
  </div>
  <Sparkline data={activity} label={label || undefined} class={className} />
</div>
