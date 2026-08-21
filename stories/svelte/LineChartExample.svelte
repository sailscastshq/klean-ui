<script>
  import LineChart from "../../registry/line-chart/svelte/LineChart.svelte";

  let {
    caption = "Signups — last 7 days",
    emptyLabel = "No data",
    class: className = "",
  } = $props();

  const signups = [
    { label: "Fri", value: 4, detail: "Friday, 4 signups" },
    { label: "Sat", value: 4, detail: "Saturday, 4 signups" },
    { label: "Sun", value: 9, detail: "Sunday, 9 signups" },
    { label: "Mon", value: 9, detail: "Monday, 9 signups" },
    { label: "Tue", value: 4, detail: "Tuesday, 4 signups" },
    { label: "Wed", value: 4, detail: "Wednesday, 4 signups" },
    { label: "Thu", value: 4, detail: "Thursday, 4 signups" },
  ];
</script>

<LineChart
  data={signups}
  {caption}
  {emptyLabel}
  class={className}
/>
