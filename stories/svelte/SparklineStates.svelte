<script>
  import Sparkline from "../../registry/sparkline/svelte/Sparkline.svelte";

  const activity = [
    { label: "A", value: 12 },
    { label: "B", value: 18 },
    { label: "C", value: undefined },
    { label: "D", value: -4 },
    { label: "E", value: 24 },
  ];
</script>

<div class="grid gap-5 sm:grid-cols-2">
  <Sparkline data={activity} class="h-10 w-64" />
  <Sparkline
    data={[{ label: "Now", value: 7 }]}
    label="One sample: 7"
    class="h-10 w-64 text-violet-700 dark:text-violet-300"
  />
</div>
