<script>
  import { onMount } from "svelte";
  import Toast from "../../registry/toast/svelte/Toast.svelte";
  import { createToast } from "../../registry/toast/toast.js";
  import { deployment, longNotification } from "../toast-overflow.js";

  let { custom = false } = $props();
  const notifications = createToast({ duration: false });

  function notify() {
    notifications(
      custom
        ? {
            deployment,
            class:
              "block overflow-visible bg-transparent p-0 shadow-none ring-0 dark:bg-transparent",
          }
        : longNotification,
    );
  }

  onMount(() => notifications.destroy);
</script>

<div class="klean-toast-motion-preview">
  <button
    type="button"
    class="min-h-11 cursor-pointer rounded-md bg-gray-950 px-4 py-2 font-medium text-white hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2"
    onclick={notify}
  >
    {custom ? "Show deployment notification" : "Show long notification"}
  </button>
  {#if custom}
    <Toast
      controller={notifications}
      position="bottom-right"
      from="none"
      to="none"
      class="w-80 max-w-[calc(100vw-2rem)] overflow-y-auto"
    >
      {#snippet children({ item, dismiss })}
        <article
          data-slot="deployment-card"
          class="rounded-xl bg-white p-4 text-gray-950 shadow-xl ring-1 ring-gray-950/10 dark:bg-gray-950 dark:text-white dark:ring-white/15"
        >
          <div class="flex items-start gap-3">
            <span
              aria-hidden="true"
              class="grid size-10 shrink-0 place-items-center rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
            >
              ✓
            </span>
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-2">
                <p class="text-sm font-medium">Deployment ready</p>
                <button
                  type="button"
                  data-slot="deployment-dismiss"
                  class="grid size-9 shrink-0 cursor-pointer place-items-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 dark:hover:bg-gray-800 dark:hover:text-white dark:focus-visible:ring-white"
                  aria-label="Dismiss deployment notification"
                  onclick={dismiss}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <a
                href="#deployment"
                data-slot="deployment-link"
                class="mt-0.5 block w-full truncate text-left text-sm font-medium hover:underline focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 dark:focus-visible:ring-white"
              >
                {item.deployment.project.name} / {item.deployment.environment
                  .name}
                / {item.deployment.app.name}
              </a>
              <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {item.deployment.gitBranch}
              </p>
            </div>
          </div>
        </article>
      {/snippet}
    </Toast>
  {:else}
    <Toast
      controller={notifications}
      position="bottom-right"
      from="none"
      to="none"
    />
  {/if}
</div>
