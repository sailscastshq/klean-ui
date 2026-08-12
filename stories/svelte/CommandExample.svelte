<script>
  import Command from "../../registry/command/svelte/Command.svelte";

  const commands = [
    {
      id: "nav.projects",
      title: "Go to Projects",
      keywords: ["dashboard", "apps"],
      group: "Navigation",
      shortcut: "G P",
    },
    {
      id: "nav.lookout",
      title: "Go to Lookout",
      keywords: ["monitoring", "metrics"],
      group: "Navigation",
      shortcut: "G L",
    },
    {
      id: "action.deploy",
      title: "Deploy application",
      keywords: ["ship", "release"],
      group: "Actions",
      shortcut: "D",
    },
    {
      id: "action.restart",
      title: "Restart production",
      keywords: ["reboot"],
      group: "Actions",
      disabled: true,
    },
  ];
  let selected = $state("Nothing yet");
</script>

<div class="grid w-[min(32rem,calc(100vw-2rem))] gap-3">
  <Command
    {commands}
    label="Search commands"
    onselect={(command) => (selected = command.title)}
  />
  <p class="text-sm text-gray-500" aria-live="polite">Selected: {selected}</p>
</div>
