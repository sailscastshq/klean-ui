<script>
  import { onMount } from "svelte";
  import Toast from "../../registry/toast/svelte/Toast.svelte";
  import { createToast } from "../../registry/toast/toast.js";

  let {
    position = "top-right",
    from = "right",
    to = "right",
    custom = false,
  } = $props();

  const notifications = createToast();

  function notify() {
    if (custom) {
      notifications({
        status: "Building image",
        progress: 42,
        duration: false,
      });
    } else {
      notifications({
        title: "Svelte notification",
        message: "Svelte 5 runes subscribe to the same controller.",
      });
    }
  }

  onMount(() => notifications.destroy);
</script>

<div class="grid justify-items-center gap-3">
  <button
    type="button"
    class="min-h-11 cursor-pointer rounded-md bg-gray-950 px-4 py-2 font-medium text-white hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2"
    onclick={notify}
  >
    {custom ? "Start deployment" : "Show toast"}
  </button>
  <p class="text-sm text-gray-500">Svelte 5 renderer</p>

  {#if custom}
    <Toast {position} {from} {to} controller={notifications}>
      {#snippet children({ item, dismiss })}
        <div class="grid gap-3">
          <div class="flex items-center justify-between gap-3">
            <p class="text-sm font-semibold">{item.status}</p>
            <button
              type="button"
              class="grid size-8 cursor-pointer place-items-center rounded-md hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950"
              aria-label="Dismiss deployment notification"
              onclick={dismiss}
            >×</button>
          </div>
          <div class="h-1.5 overflow-hidden rounded-full bg-gray-200">
            <div class="h-full rounded-full bg-blue-600" style:width={`${item.progress}%`}></div>
          </div>
        </div>
      {/snippet}
    </Toast>
  {:else}
    <Toast {position} {from} {to} controller={notifications} />
  {/if}
</div>
