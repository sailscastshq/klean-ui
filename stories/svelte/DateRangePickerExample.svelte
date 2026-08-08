<script>
  import DateRangePicker from "../../registry/date-range-picker/svelte/DateRangePicker.svelte";

  let {
    name = "period",
    label = "Report period",
    min = "2026-01-01",
    max = "2026-12-31",
    required = true,
    disabled = false,
    readonly = false,
    class: className = "w-[min(38rem,calc(100vw-2rem))]",
  } = $props();
  let value = $state({ start: "2026-08-08", end: "2026-08-12" });
</script>

<DateRangePicker
  bind:value
  {name}
  {label}
  {min}
  {max}
  {required}
  {disabled}
  {readonly}
  class={className}
/>
