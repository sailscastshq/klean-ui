<script>
  import { onMount } from "svelte";
  import Toast from "../../registry/toast/svelte/Toast.svelte";
  import { createToast } from "../../registry/toast/toast.js";
  const notifications = createToast({ duration: false, max: 0 });
  onMount(() => {
    for (let index = 1; index <= 7; index++)
      notifications({
        title: `Deployment ${index}`,
        message:
          index === 4
            ? "A longer build notification with details about dependency installation and production health checks."
            : "Building the production image.",
        class: "shadow-none",
      });
    return notifications.destroy;
  });
</script>

<main class="min-h-dvh bg-gray-50 p-8 dark:bg-gray-900">
  <h1 class="text-2xl font-semibold">Deployments</h1>
  <p class="mt-2 text-sm text-gray-500">
    Open the notification stack to inspect each build.
  </p>
  <button
    type="button"
    class="mt-6 min-h-11 cursor-pointer rounded-lg bg-gray-950 px-4 text-sm text-white"
    onclick={() =>
      notifications({
        title: "New deployment",
        message: "Building the production image.",
        class: "shadow-none",
      })}>Start another build</button
  >
  <Toast controller={notifications} position="bottom-right" class="w-80" />
</main>
