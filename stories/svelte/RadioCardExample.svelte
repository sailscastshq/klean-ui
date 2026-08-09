<script>
  import Radio from "../../registry/radio/svelte/Radio.svelte";

  let scope = $state("project");
</script>

<fieldset class="w-96 max-w-[calc(100vw-2rem)]">
  <legend class="text-sm font-semibold">Visibility</legend>
  <div class="mt-3 grid grid-cols-2 gap-2">
    {#each ["personal", "project"] as value}
      <label class="cursor-pointer rounded-lg border border-gray-200 px-3 py-3 capitalize has-[:checked]:border-gray-950 has-[:checked]:bg-gray-50 dark:border-gray-800 dark:has-[:checked]:border-white dark:has-[:checked]:bg-gray-900">
        <Radio bind:group={scope} class="sr-only" name="svelte-scope" {value} />
        <span class="text-sm font-medium">{value}</span>
      </label>
    {/each}
  </div>
</fieldset>
