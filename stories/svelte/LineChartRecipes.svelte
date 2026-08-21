<script>
  import LineChart from "../../registry/line-chart/svelte/LineChart.svelte";
  import Sparkline from "../../registry/sparkline/svelte/Sparkline.svelte";

  const signups = [
    { label: "Fri", value: 4, detail: "Friday, 4 signups" },
    { label: "Sat", value: 4, detail: "Saturday, 4 signups" },
    { label: "Sun", value: 9, detail: "Sunday, 9 signups" },
    { label: "Mon", value: 9, detail: "Monday, 9 signups" },
    { label: "Tue", value: 4, detail: "Tuesday, 4 signups" },
    { label: "Wed", value: 4, detail: "Wednesday, 4 signups" },
    { label: "Thu", value: 4, detail: "Thursday, 4 signups" },
  ];
  const cpu = [
    { label: "12:00", value: 18 },
    { label: "12:10", value: 23 },
    { label: "12:20", value: 21 },
    { label: "12:30", value: 48 },
    { label: "12:40", value: 36 },
    { label: "12:50", value: 61 },
    { label: "13:00", value: 42 },
  ];
</script>

<section class="grid w-[min(92vw,64rem)] gap-8 lg:grid-cols-2">
  <article class="dark rounded-xl bg-gray-950 p-6 text-white shadow-xl">
    <p class="font-mono text-[11px] uppercase tracking-[0.18em] text-gray-400">Slipway / Lookout</p>
    <div class="mt-4 flex items-end gap-4">
      <strong class="text-3xl tabular-nums">42%</strong>
      <Sparkline data={cpu} class="mb-1 h-7 w-32 text-emerald-400" />
    </div>
    <LineChart data={cpu} caption="CPU — last hour" class="mt-8 h-56 text-emerald-400 **:data-[slot=line-chart-caption]:text-white **:data-[slot=line-chart-labels]:text-gray-400" />
  </article>
  <article class="border-2 border-gray-950 bg-[#f7f3eb] p-6 text-gray-950 shadow-[6px_6px_0_0_#111]">
    <LineChart data={signups} caption="Signups — last 7 days" class="h-72 text-gray-950 dark:text-gray-950 **:data-[slot=line-chart-caption]:text-lg **:data-[slot=line-chart-labels]:text-gray-600" />
  </article>
</section>
