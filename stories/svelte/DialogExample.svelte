<script>
  import Button from "../../registry/button/svelte/Button.svelte";
  import Dialog from "../../registry/dialog/svelte/Dialog.svelte";
  import { contract } from "../shared/contract.js";

  let open = $state(false);
</script>

{#snippet content()}
  <h2 id="svelte-dialog-title" class="text-xl font-semibold">
    {contract.dialogTitle}
  </h2>
  <p id="svelte-dialog-description" class="mt-2 text-sm leading-6 text-gray-600">
    The browser owns modal behavior; the application owns this message and every
    action.
  </p>
  <form method="dialog" class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
    <Button
      type="submit"
      value="cancel"
      autofocus
      class="bg-white text-gray-950 ring-1 ring-inset ring-gray-300 hover:bg-gray-100"
    >
      Cancel
    </Button>
    <Button
      type="submit"
      value="delete"
      class="bg-red-700 hover:bg-red-800 active:bg-red-900"
    >
      Delete project
    </Button>
  </form>
{/snippet}

<div class="grid justify-items-start gap-3">
  <p class="text-sm text-gray-600" aria-live="polite">
    Dialog is {open ? "open" : "closed"}
  </p>
  <Button commandfor={contract.dialogId} command="show-modal">
    {contract.dialogLabel}
  </Button>
  <Dialog
    id={contract.dialogId}
    bind:open
    aria-labelledby="svelte-dialog-title"
    aria-describedby="svelte-dialog-description"
    children={content}
  />
</div>
