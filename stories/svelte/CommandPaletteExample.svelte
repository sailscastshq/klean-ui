<script>
  import Button from "../../registry/button/svelte/Button.svelte";
  import Command from "../../registry/command/svelte/Command.svelte";
  import CommandEmpty from "../../registry/command/svelte/CommandEmpty.svelte";
  import CommandGroup from "../../registry/command/svelte/CommandGroup.svelte";
  import CommandInput from "../../registry/command/svelte/CommandInput.svelte";
  import CommandItem from "../../registry/command/svelte/CommandItem.svelte";
  import CommandList from "../../registry/command/svelte/CommandList.svelte";
  import CommandSeparator from "../../registry/command/svelte/CommandSeparator.svelte";
  import CommandShortcut from "../../registry/command/svelte/CommandShortcut.svelte";
  import Dialog from "../../registry/dialog/svelte/Dialog.svelte";

  const navigation = [
    {
      label: "Go to Projects",
      description: "View every application and service",
      keywords: ["dashboard", "apps"],
      shortcut: "G P",
      icon: "M3 7.5h7l2 2h9v9H3z M3 7.5v-2h7l2 2",
    },
    {
      label: "Go to Lookout",
      description: "Inspect metrics and recent incidents",
      keywords: ["monitoring", "metrics", "cpu", "memory"],
      shortcut: "G L",
      icon: "M4 18V9m5 9V5m5 13v-7m5 7V3",
    },
    {
      label: "Open Settings",
      description: "Manage this Slipway instance",
      keywords: ["preferences", "configuration"],
      shortcut: "G S",
      icon: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-2.12 2.12-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.03 1.57V20h-3v-.09a1.7 1.7 0 0 0-1.03-1.57 1.7 1.7 0 0 0-1.88.34l-.06.06-2.12-2.12.06-.06A1.7 1.7 0 0 0 7 14.68a1.7 1.7 0 0 0-1.57-1.03H5v-3h.09A1.7 1.7 0 0 0 6.66 9.6a1.7 1.7 0 0 0-.34-1.88l-.06-.06 2.12-2.12.06.06A1.7 1.7 0 0 0 10.32 6a1.7 1.7 0 0 0 1.03-1.57V4h3v.09A1.7 1.7 0 0 0 15.4 5.66a1.7 1.7 0 0 0 1.88-.34l.06-.06 2.12 2.12-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.57 1.03H21v3h-.09A1.7 1.7 0 0 0 19.4 15Z",
    },
  ];
  const actions = [
    {
      label: "Deploy application",
      description: "Choose an application to deploy",
      keywords: ["ship", "release"],
      shortcut: "D",
      icon: "M15.5 14.5a6 6 0 0 1-6 6v-4m6-2A15 15 0 0 0 21 3a15 15 0 0 0-11.5 5.5m6 6a15 15 0 0 1-6 2m0-8a6 6 0 0 0-6 6h4m2-6a15 15 0 0 0-2 6m2 2 2.5 2.5 M16.5 8.5h.01",
    },
    {
      label: "Create project",
      description: "Start a new deployment workspace",
      keywords: ["new", "add"],
      shortcut: "N",
      icon: "M12 5v14M5 12h14",
    },
    {
      label: "Restart production",
      description: "Unavailable during the active deployment",
      keywords: ["reboot", "reload"],
      shortcut: "",
      disabled: true,
      icon: "M20 7v5h-5 M4 17v-5h5 M6.1 9A7 7 0 0 1 18.7 7.2L20 12 M4 12l1.3 4.8A7 7 0 0 0 17.9 15",
    },
  ];
  let dialog;
  let query = $state("");
  let selected = $state("Nothing yet");

  function run(value) {
    selected = value;
    query = "";
    dialog?.close();
  }

  function handleOpen(open) {
    if (open) query = "";
  }
</script>

<div class="grid justify-items-start gap-3">
  <Button commandfor="svelte-command-palette" command="show-modal">
    Open command palette
    <kbd aria-hidden="true" class="ml-3 rounded bg-white/15 px-1.5 py-0.5 text-xs">⌘ K</kbd>
  </Button>
  <p class="text-sm text-gray-500" aria-live="polite">Selected: {selected}</p>
  <Dialog
    bind:this={dialog}
    id="svelte-command-palette"
    aria-label="Command palette"
    class="m-0 mx-auto mt-[20vh] max-w-lg rounded-xl border-0 bg-transparent p-0 shadow-none backdrop:bg-black/50 backdrop:backdrop-blur-sm"
    onOpenChange={handleOpen}
  >
    <Command
      bind:query
      onselect={run}
      class="rounded-xl border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900"
    >
      <div class="flex items-center border-b border-gray-100 px-4 dark:border-gray-800">
        <svg
          aria-hidden="true"
          class="size-4 shrink-0 text-gray-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            d="m21 21-4.35-4.35m1.35-5.15a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0Z"
            stroke-linecap="round"
          />
        </svg>
        <CommandInput
          autofocus
          aria-label="Search commands"
          class="border-0 px-3 py-3.5 text-sm focus-visible:outline-none"
        />
        <kbd
          aria-hidden="true"
          class="hidden shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:bg-gray-800 dark:text-gray-500 sm:inline"
        >ESC</kbd>
      </div>
      <CommandList aria-label="Available commands" class="max-h-72 p-1.5">
        <CommandEmpty>No matching command.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {#each navigation as item (item.label)}
            <CommandItem value={item.label} keywords={item.keywords}>
              <span class="flex size-7 shrink-0 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
                <svg
                  aria-hidden="true"
                  class="size-3.5 text-gray-500 dark:text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path d={item.icon} stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <span class="flex min-w-0 flex-1 flex-col">
                <span class="truncate">{item.label}</span>
                <span class="truncate text-xs text-gray-400 dark:text-gray-500">{item.description}</span>
              </span>
              <CommandShortcut>{item.shortcut}</CommandShortcut>
            </CommandItem>
          {/each}
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Actions">
          {#each actions as item (item.label)}
            <CommandItem value={item.label} keywords={item.keywords} disabled={item.disabled}>
              <span class="flex size-7 shrink-0 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800">
                <svg
                  aria-hidden="true"
                  class="size-3.5 text-gray-500 dark:text-gray-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path d={item.icon} stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </span>
              <span class="flex min-w-0 flex-1 flex-col">
                <span class="truncate">{item.label}</span>
                <span class="truncate text-xs text-gray-400 dark:text-gray-500">{item.description}</span>
              </span>
              {#if item.shortcut}<CommandShortcut>{item.shortcut}</CommandShortcut>{/if}
            </CommandItem>
          {/each}
        </CommandGroup>
      </CommandList>
      <div class="flex items-center gap-4 border-t border-gray-100 px-4 py-2 text-[11px] text-gray-400 dark:border-gray-800 dark:text-gray-500">
        <span class="flex items-center gap-1"><kbd class="rounded bg-gray-100 px-1 py-0.5 font-mono dark:bg-gray-800">↑↓</kbd> navigate</span>
        <span class="flex items-center gap-1"><kbd class="rounded bg-gray-100 px-1 py-0.5 font-mono dark:bg-gray-800">↵</kbd> select</span>
        <span class="flex items-center gap-1"><kbd class="rounded bg-gray-100 px-1 py-0.5 font-mono dark:bg-gray-800">esc</kbd> close</span>
      </div>
    </Command>
  </Dialog>
</div>
