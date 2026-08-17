<script>
  import Separator from "../../registry/separator/svelte/Separator.svelte";
</script>

<div
  class="w-[min(88vw,32rem)] rounded-xl bg-white p-6 shadow-sm dark:bg-gray-950"
>
  <section aria-labelledby="svelte-profile-title">
    <h2 id="svelte-profile-title" class="font-semibold">Profile</h2>
    <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
      Personal account details.
    </p>
  </section>
  <Separator class="my-6" />
  <section aria-labelledby="svelte-security-title">
    <h2 id="svelte-security-title" class="font-semibold">Security</h2>
    <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
      Sign-in and recovery settings.
    </p>
  </section>
</div>
