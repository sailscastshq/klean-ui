<script>
  import Command from "../../registry/command/svelte/Command.svelte";
  import CommandEmpty from "../../registry/command/svelte/CommandEmpty.svelte";
  import CommandGroup from "../../registry/command/svelte/CommandGroup.svelte";
  import CommandInput from "../../registry/command/svelte/CommandInput.svelte";
  import CommandItem from "../../registry/command/svelte/CommandItem.svelte";
  import CommandList from "../../registry/command/svelte/CommandList.svelte";
  import CommandSeparator from "../../registry/command/svelte/CommandSeparator.svelte";
  import CommandShortcut from "../../registry/command/svelte/CommandShortcut.svelte";

  const navigation = [
    ["Go to Projects", ["dashboard", "apps"], "G P"],
    ["Go to Lookout", ["monitoring", "metrics"], "G L"],
    ["Open Settings", ["preferences", "configuration"], "G S"],
  ];
  const actions = [
    ["Deploy application", ["ship", "release"], "D", false],
    ["Create project", ["new", "add"], "N", false],
    ["Restart production", ["reboot"], "", true],
  ];
  let selected = $state("Nothing yet");
</script>

<div class="grid w-[min(32rem,calc(100vw-2rem))] gap-3">
  <Command onselect={(value) => (selected = value)}>
    <CommandInput autofocus aria-label="Search commands" />
    <CommandList aria-label="Available commands">
      <CommandEmpty>No matching command.</CommandEmpty>
      <CommandGroup heading="Navigation">
        {#each navigation as [label, keywords, shortcut] (label)}
          <CommandItem value={label} {keywords}>
            <span class="font-medium">{label}</span>
            <CommandShortcut>{shortcut}</CommandShortcut>
          </CommandItem>
        {/each}
      </CommandGroup>
      <CommandSeparator />
      <CommandGroup heading="Actions">
        {#each actions as [label, keywords, shortcut, disabled] (label)}
          <CommandItem value={label} {keywords} {disabled}>
            <span class="font-medium">{label}</span>
            {#if shortcut}<CommandShortcut>{shortcut}</CommandShortcut>{/if}
          </CommandItem>
        {/each}
      </CommandGroup>
    </CommandList>
  </Command>
  <p class="text-sm text-gray-500" aria-live="polite">Selected: {selected}</p>
</div>
