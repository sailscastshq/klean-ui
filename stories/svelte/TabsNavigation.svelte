<script>
  import Tabs from "../../registry/tabs/svelte/Tabs.svelte";

  let current = $state("profile");
  const sections = [
    { value: "profile", label: "Profile", href: "#profile" },
    { value: "billing", label: "Billing", href: "#billing" },
    { value: "schedule", label: "Schedule", href: "#schedule" },
  ];
</script>

<Tabs
  bind:value={current}
  orientation="vertical"
  aria-label="Account settings"
  class="w-[min(34rem,calc(100vw-2rem))] border-2 border-black bg-white p-6 shadow-[5px_5px_0_#111] dark:border-white dark:bg-gray-950 dark:shadow-[5px_5px_0_#fff]"
>
  <nav class="flex flex-col gap-1">
    {#each sections as section (section.value)}
      <a
        href={section.href}
        data-value={section.value}
        class="min-h-11 cursor-pointer rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 outline-none hover:bg-gray-100 hover:text-gray-950 focus-visible:ring-2 data-[state=active]:bg-gray-950 data-[state=active]:text-white dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-white dark:data-[state=active]:bg-white dark:data-[state=active]:text-gray-950"
        onclick={() => (current = section.value)}
      >{section.label}</a>
    {/each}
  </nav>
</Tabs>
