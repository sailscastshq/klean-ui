<script>
  import ContextMenu from "../../registry/context-menu/svelte/ContextMenu.svelte";
  let {
    disabled = false,
    class: className = "w-52",
    placement = "bottom-start",
    offset = 0,
  } = $props();
  let actions = $state();
  const itemClass =
    "block w-full rounded px-3 py-2 text-left text-sm outline-none focus:bg-gray-100 dark:focus:bg-gray-800";
</script>

<div class="w-72 space-y-3">
  <div
    id="context-project"
    tabindex="0"
    class="rounded-lg border border-gray-200 p-8 outline-none focus:ring-2 focus:ring-gray-500 dark:border-gray-700"
  >
    <p class="font-medium">Northstar project</p>
    <p class="mt-2 text-sm text-gray-500">Right-click or press Shift+F10</p>
  </div>
  <button
    type="button"
    onclick={(event) => actions.show(event.currentTarget)}
    class="rounded border border-gray-200 px-3 py-2 text-sm dark:border-gray-700"
    >Actions</button
  >
  <ContextMenu
    bind:this={actions}
    target="context-project"
    {disabled}
    class={className}
    {placement}
    {offset}
    aria-label="Project actions"
  >
    <button type="button" class={itemClass}>Rename</button><button
      type="button"
      disabled
      class={`${itemClass} opacity-40`}>Archive</button
    ><a href="#project" class={itemClass}>Open project</a>
  </ContextMenu>
</div>
