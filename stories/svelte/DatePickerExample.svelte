<script>
  import DatePicker from "../../registry/date-picker/svelte/DatePicker.svelte";

  let {
    value = "2026-08-12",
    name = "dueAt",
    min = "2026-08-01",
    required = true,
    disabled = false,
    readonly = false,
    class: className = "w-72",
  } = $props();
</script>

<div class="grid gap-2">
  <label for="svelte-date-picker" class="text-sm font-medium">Due date</label>
  <DatePicker
    id="svelte-date-picker"
    bind:value
    {name}
    {min}
    {required}
    {disabled}
    {readonly}
    class={className}
  />
</div>
