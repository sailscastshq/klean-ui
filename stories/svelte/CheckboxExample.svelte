<script>
  import Checkbox from "../../registry/checkbox/svelte/Checkbox.svelte";

  let {
    label = "Send deployment notifications",
    defaultChecked = false,
    indeterminate = false,
    disabled = false,
  } = $props();
  let checked = $state(false);

  $effect(() => {
    checked = Boolean(defaultChecked);
  });
</script>

<label class="flex w-80 cursor-pointer items-start gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-950">
  <Checkbox bind:checked {indeterminate} {disabled} />
  <span>
    <span class="block text-sm font-medium">{label}</span>
    <span class="mt-1 block text-sm text-gray-500">
      Uses native checked binding and events.
    </span>
  </span>
</label>
