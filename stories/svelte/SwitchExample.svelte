<script>
  import Switch from "../../registry/switch/svelte/Switch.svelte";

  let {
    label = "Enable preview releases",
    description = "New releases become available to preview as soon as they build.",
    defaultChecked = false,
    disabled = false,
    required = false,
    invalid = false,
    class: className = "",
  } = $props();
  let checked = $state(false);

  $effect(() => {
    checked = Boolean(defaultChecked);
  });
</script>

<div class="w-[min(26rem,calc(100vw-2rem))] rounded-xl border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-800 dark:bg-gray-950">
  <label class="flex min-h-16 cursor-pointer items-center justify-between gap-6 rounded-lg px-4 py-3 has-[:disabled]:cursor-not-allowed">
    <span class="min-w-0">
      <span class="block text-sm font-medium">{label}</span>
      <span class="mt-1 block text-sm leading-5 text-gray-500">{description}</span>
    </span>
    <Switch
      bind:checked
      {disabled}
      {required}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid ? "svelte-switch-error" : undefined}
      class={className}
    />
  </label>
  {#if invalid}
    <p id="svelte-switch-error" class="px-4 pb-3 text-sm text-red-600 dark:text-red-400">
      This setting could not be saved.
    </p>
  {/if}
</div>
