<script>
  import MultiSelect from "../../registry/multi-select/svelte/MultiSelect.svelte";
  let {
    options = [
      { value: "design", label: "Design" },
      { value: "engineering", label: "Engineering", disabled: true },
      { value: "support", label: "Support" },
      { value: "operations", label: "Operations" },
    ],
    defaultValue = ["design"],
    disabled = false,
    required = true,
  } = $props();
</script>

<form class="grid w-80 max-w-full gap-3">
  <MultiSelect
    {options}
    {defaultValue}
    {disabled}
    {required}
    name="teams"
    aria-label="Teams"
  /><button type="reset">Reset</button><button type="submit">Submit</button>
</form>
