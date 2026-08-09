<script>
  import Radio from "../../registry/radio/svelte/Radio.svelte";
  import { contract } from "../shared/contract.js";

  let region = $state("lagos");
</script>

<form class="w-80 max-w-[calc(100vw-2rem)]" onsubmit={(event) => event.preventDefault()}>
  <fieldset>
    <legend class="text-sm font-semibold">{contract.radioLegend}</legend>
    <div class="mt-3 space-y-3">
      {#each contract.radioOptions as label}
        <label class="flex cursor-pointer items-center gap-3 text-sm">
          <Radio
            bind:group={region}
            name="svelte-form-region"
            value={label.toLowerCase()}
          />
          {label}
        </label>
      {/each}
    </div>
  </fieldset>
  <div class="mt-5 flex items-center gap-3">
    <button type="reset" class="min-h-11 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium dark:border-gray-700">Reset</button>
    <output class="font-mono text-xs text-gray-500">{region}</output>
  </div>
</form>
