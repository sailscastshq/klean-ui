<script>
  import { untrack } from "svelte";
  import RichText from "../../registry/rich-text/svelte/RichText.svelte";

  let {
    format = "html",
    initialValue,
    required = false,
    disabled = false,
    readonly = false,
    placeholder = "Write something worth sharing…",
    form = false,
    custom = false,
    class: className = "",
  } = $props();
  const id = $props.id();
  const HTML =
    "<h2>A little context goes a long way</h2><p>Describe the work, share a useful link, and make the next step clear.</p><ul><li>Keep the details together.</li><li>Make it easy for someone else to pick up.</li></ul>";
  const MARKDOWN =
    "## Ready for the next release\n\nThe new dashboard is **ready for review**.\n\n- Check the deployment notes\n- Share feedback with the team\n\n[View the project](https://sailscasts.com)\n";
  const BUTTON =
    "cursor-pointer rounded-md border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-offset-2 dark:border-gray-700 dark:hover:bg-gray-900";
  let value = $state(
    untrack(() => initialValue ?? (format === "markdown" ? MARKDOWN : HTML)),
  );
  let saved = $state(null);
</script>

{#snippet customToolbar({ editor, mode, setMode })}
  <div class="flex flex-wrap items-center gap-2 p-2">
    <button
      type="button"
      class={BUTTON}
      disabled={!editor || mode !== "visual"}
      aria-pressed={editor?.isActive("bold") ?? false}
      onclick={() => editor.chain().focus().toggleBold().run()}>Bold</button
    >
    <button
      type="button"
      class={BUTTON}
      onclick={() => setMode(mode === "source" ? "visual" : "source")}
      >{mode === "source" ? "Write" : "Source"}</button
    >
  </div>
{/snippet}

{#snippet content()}
  <label for={id} class="text-sm font-medium"
    >{format === "markdown" ? "Release notes" : "Project description"}</label
  >
  <RichText
    {id}
    name="body"
    bind:value
    {format}
    {required}
    {disabled}
    {readonly}
    {placeholder}
    class={className}
    aria-describedby={`${id}-help`}
    toolbar={custom ? customToolbar : undefined}
  />
  <p id={`${id}-help`} class="text-sm text-gray-500">
    {readonly
      ? "Read-only content can still be selected and copied."
      : "Write comfortably, or edit the source directly."}
  </p>
  {#if form}
    <div class="flex gap-2">
      <button type="submit" class={BUTTON}>Save description</button><button
        type="reset"
        class={BUTTON}>Reset</button
      >
    </div>
  {/if}
  {#if saved !== null}<output
      class="block max-h-48 overflow-auto rounded-md bg-gray-100 p-3 font-mono text-xs whitespace-pre-wrap wrap-break-word dark:bg-gray-900"
      >{saved}</output
    >{/if}
{/snippet}

{#if form}
  <form
    class="grid w-[min(44rem,calc(100vw-2rem))] gap-3"
    onsubmit={(event) => {
      event.preventDefault();
      saved = String(new FormData(event.currentTarget).get("body") ?? "");
    }}
  >
    {@render content()}
  </form>
{:else}
  <div class="grid w-[min(44rem,calc(100vw-2rem))] gap-3">
    {@render content()}
  </div>
{/if}
