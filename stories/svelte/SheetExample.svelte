<script>
  import Button from "../../registry/button/svelte/Button.svelte";
  import Sheet from "../../registry/sheet/svelte/Sheet.svelte";
  import { contract } from "../shared/contract.js";

  let open = $state(false);
</script>

{#snippet content()}
  <article class="grid h-full grid-rows-[auto_minmax(0,1fr)_auto]">
    <header class="flex items-center justify-between border-b border-gray-200 px-5 py-5">
      <h2 id="svelte-sheet-title" class="text-xl font-semibold">
        {contract.sheetTitle}
      </h2>
      <Button
        commandfor={contract.sheetId}
        command="request-close"
        autofocus
        aria-label="Close project details"
        class="min-h-11 min-w-11 bg-transparent p-0 text-gray-600 hover:bg-gray-100"
      >
        <span aria-hidden="true" class="text-xl leading-none">×</span>
      </Button>
    </header>
    <div class="overflow-y-auto px-5 py-6 text-sm text-gray-600">
      Framework-native state observes the same native dialog.
    </div>
    <form method="dialog" class="border-t border-gray-200 p-5">
      <Button type="submit" value="done" class="w-full">Done</Button>
    </form>
  </article>
{/snippet}

<main class="klean-story-canvas grid min-h-128 place-items-center px-5 py-12">
  <Button commandfor={contract.sheetId} command="show-modal">
    {contract.sheetLabel}
  </Button>
  <Sheet
    id={contract.sheetId}
    bind:open
    aria-labelledby="svelte-sheet-title"
    children={content}
  />
</main>
