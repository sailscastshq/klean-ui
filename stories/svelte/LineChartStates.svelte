<script>
  import LineChart from "../../registry/line-chart/svelte/LineChart.svelte";
</script>

<div class="grid w-[min(92vw,64rem)] gap-8 md:grid-cols-3">
  <LineChart data={[]} caption="Empty" class="h-56" />
  <LineChart data={[{ label: "Now", value: 8 }]} caption="One point" class="h-56" />
  <LineChart data={[{ label: "A", value: -5 }, { label: "B", value: 0 }, { label: "C", value: 8 }]} caption="Zero and negative" class="h-56" />
</div>
