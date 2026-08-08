<script>
  import SchedulePicker from "../../registry/schedule-picker/svelte/SchedulePicker.svelte";

  let {
    name = "publishAt",
    timeZone = "Africa/Lagos",
    minuteStep = 15,
    required = true,
    disabled = false,
    readonly = false,
    class: className = "w-[min(34rem,calc(100vw-2rem))]",
  } = $props();
  let value = $state("");
</script>

<div class="grid gap-2">
  <label for="svelte-schedule-picker" class="text-sm font-medium">
    Publish at
  </label>
  <SchedulePicker
    id="svelte-schedule-picker"
    bind:value
    {name}
    {timeZone}
    {minuteStep}
    {required}
    {disabled}
    {readonly}
    class={className}
  />
  <output class="break-all font-mono text-xs text-gray-500">
    {value || "No committed instant yet"}
  </output>
</div>
