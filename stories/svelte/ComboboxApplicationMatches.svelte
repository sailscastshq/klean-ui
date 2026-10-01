<script>
  import Combobox from "../../registry/combobox/svelte/Combobox.svelte";
  let { filter = false } = $props();
  let value = $state();
  const results = [
    { value: "archived", label: "Archived vehicle", disabled: true },
    { value: 42, label: "Automobile" },
    { value: 7, label: "Motor vehicle" },
  ];
</script>

<form
  class="grid w-[min(24rem,calc(100vw-2rem))] gap-2"
  onsubmit={(event) => event.preventDefault()}
>
  <label for="matched-vehicle" class="text-sm font-medium">Vehicle</label>
  <Combobox
    id="matched-vehicle"
    bind:value
    name="vehicle"
    options={results}
    {filter}
  />
  <p class="text-sm text-gray-500 dark:text-gray-400">
    Type car, then choose Automobile. Results retain their application order.
  </p>
  <output class="text-sm">Committed value: {value ?? "none"}</output>
  <button
    type="button"
    class="min-h-11 rounded-md border border-gray-300 px-3 text-sm dark:border-gray-700"
    >After combobox</button
  >
</form>
