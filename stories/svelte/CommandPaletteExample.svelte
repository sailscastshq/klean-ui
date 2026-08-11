<script>
  import Button from "../../registry/button/svelte/Button.svelte";
  import Command from "../../registry/command/svelte/Command.svelte";
  import Dialog from "../../registry/dialog/svelte/Dialog.svelte";

  const commands = [
    {
      id: "nav.projects",
      title: "Go to Projects",
      subtitle: "View every application and service",
      keywords: ["dashboard", "apps"],
      group: "Navigation",
      shortcut: "G P",
      icon: "M3 7.5h7l2 2h9v9H3z M3 7.5v-2h7l2 2",
    },
    {
      id: "nav.lookout",
      title: "Go to Lookout",
      subtitle: "Inspect metrics and recent incidents",
      keywords: ["monitoring", "metrics", "cpu", "memory"],
      group: "Navigation",
      shortcut: "G L",
      icon: "M4 18V9m5 9V5m5 13v-7m5 7V3",
    },
    {
      id: "nav.settings",
      title: "Open Settings",
      subtitle: "Manage this workspace",
      keywords: ["preferences", "configuration"],
      group: "Navigation",
      shortcut: "G S",
      icon: "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z",
    },
    {
      id: "action.deploy",
      title: "Deploy application",
      subtitle: "Choose an application to deploy",
      keywords: ["ship", "release"],
      group: "Actions",
      shortcut: "D",
      icon: "M15.5 14.5a6 6 0 0 1-6 6v-4m6-2A15 15 0 0 0 21 3a15 15 0 0 0-11.5 5.5m6 6a15 15 0 0 1-6 2m0-8a6 6 0 0 0-6 6h4m2-6a15 15 0 0 0-2 6m2 2 2.5 2.5",
    },
    {
      id: "action.create",
      title: "Create project",
      subtitle: "Start a new deployment workspace",
      keywords: ["new", "add"],
      group: "Actions",
      shortcut: "N",
      icon: "M12 5v14M5 12h14",
    },
    {
      id: "action.restart",
      title: "Restart production",
      subtitle: "Unavailable during the active deployment",
      keywords: ["reboot", "reload"],
      group: "Actions",
      disabled: true,
      destructive: true,
      icon: "M20 7v5h-5 M4 17v-5h5 M6.1 9A7 7 0 0 1 18.7 7.2L20 12",
    },
  ];
  let dialog;
  let query = $state("");
  let selected = $state("Nothing yet");

  function run(command) {
    selected = command.title;
    query = "";
    dialog?.close();
  }

  function handleOpen(open) {
    if (open) query = "";
  }
</script>

{#snippet prefix()}
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
{/snippet}

{#snippet suffix()}
  <kbd
    aria-hidden="true"
    class="hidden shrink-0 rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-400 dark:bg-gray-800 dark:text-gray-500 sm:inline"
  >ESC</kbd>
{/snippet}

{#snippet item({ command })}
  <span
    class="flex size-7 shrink-0 items-center justify-center rounded-md bg-gray-100 dark:bg-gray-800"
  >
    <svg
      aria-hidden="true"
      class="size-3.5 text-gray-500 dark:text-gray-400"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
    >
      <path
        d={command.icon}
        stroke-linecap="round"
        stroke-linejoin="round"
      />
    </svg>
  </span>
  <span class="flex min-w-0 flex-1 flex-col">
    <span class="truncate">{command.title}</span>
    <span class="truncate text-xs text-gray-400 dark:text-gray-500">
      {command.subtitle}
    </span>
  </span>
  {#if command.shortcut}
    <kbd
      aria-hidden="true"
      class="ml-auto shrink-0 font-mono text-xs text-gray-500 dark:text-gray-400"
    >
      {command.shortcut}
    </kbd>
  {/if}
{/snippet}

{#snippet footer()}
  <div
    class="flex items-center gap-4 border-t border-gray-100 px-4 py-2 text-[11px] text-gray-400 dark:border-gray-800 dark:text-gray-500"
  >
    <span class="flex items-center gap-1"
      ><kbd
        class="rounded bg-gray-100 px-1 py-0.5 font-mono dark:bg-gray-800"
        >↑↓</kbd
      > navigate</span
    >
    <span class="flex items-center gap-1"
      ><kbd
        class="rounded bg-gray-100 px-1 py-0.5 font-mono dark:bg-gray-800"
        >↵</kbd
      > select</span
    >
    <span class="flex items-center gap-1"
      ><kbd
        class="rounded bg-gray-100 px-1 py-0.5 font-mono dark:bg-gray-800"
        >esc</kbd
      > close</span
    >
  </div>
{/snippet}

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
      {commands}
      {prefix}
      {suffix}
      {item}
      {footer}
      autofocus
      label="Search commands"
      onselect={run}
      class="rounded-xl border-gray-200 bg-white shadow-2xl **:data-[slot=command-input]:px-3 dark:border-gray-700 dark:bg-gray-900"
    />
  </Dialog>
</div>
