<script>
  import TagsInput from "../../registry/tags-input/svelte/TagsInput.svelte";

  let {
    placeholder = "Add a tag",
    disabled = false,
    readonly = false,
    max = 5,
    class: className = "",
  } = $props();

  let tags = $state(["billing", "invoice"]);
  let draft = $state("");
</script>

<div class="grid w-[min(34rem,calc(100vw-2rem))] gap-2">
  <label for="svelte-tags" class="text-sm font-medium">Tags</label>
  <TagsInput
    id="svelte-tags"
    bind:value={tags}
    bind:draft
    name="tags"
    {placeholder}
    {disabled}
    {readonly}
    {max}
    class={className}
    aria-describedby="svelte-tags-help"
  />
  <p id="svelte-tags-help" class="text-sm text-gray-500">
    Enter, comma, blur, and bulk paste all commit ordinary tags.
  </p>
</div>
