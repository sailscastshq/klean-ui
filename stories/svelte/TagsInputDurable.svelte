<script>
  import TagsInput from "../../registry/tags-input/svelte/TagsInput.svelte";

  let tags = $state(["customer"]);
  let draft = $state("follow up");
</script>

<div class="grid w-[min(34rem,calc(100vw-2rem))] gap-2">
  <label for="svelte-restored-tags" class="text-sm font-medium">
    Restored labels
  </label>
  <TagsInput id="svelte-restored-tags" bind:value={tags} bind:draft />
  <p class="text-sm text-gray-500">
    Committed tags and pending text are both caller-owned.
  </p>
</div>
