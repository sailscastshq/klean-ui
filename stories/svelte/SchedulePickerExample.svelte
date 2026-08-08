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
  <button
    type="button"
    class="mt-2 min-h-11 justify-self-start rounded-md border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-950"
  >
    Continue
  </button>
</div>
