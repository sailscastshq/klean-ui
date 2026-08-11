<script>
  import Radio from "../../registry/radio/svelte/Radio.svelte";
  import { contract } from "../shared/contract.js";

  let { selected: initialSelected = "lagos", disabled = false } = $props();
  let selected = $state("lagos");

  $effect(() => {
    selected = initialSelected;
  });
</script>

<fieldset class="w-96 max-w-[calc(100vw-2rem)]">
  <legend class="text-sm font-semibold">{contract.radioLegend}</legend>
  <div class="mt-3 space-y-2">
    {#each contract.radioOptions as label}
      {@const value = label.toLowerCase()}
      <label class="flex min-h-14 cursor-pointer items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 has-checked:border-gray-950 dark:border-gray-800 dark:bg-gray-950 dark:has-checked:border-white">
        <Radio bind:group={selected} name="svelte-region" {value} {disabled} />
        <span class="text-sm font-medium">{label}</span>
      </label>
    {/each}
  </div>
</fieldset>
