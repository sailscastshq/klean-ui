<script>
  import Select from '../../registry/select/svelte/Select.svelte'

  const options = [
    { value: 'viewer', label: 'Viewer' },
    { value: 'editor', label: 'Editor', disabled: true },
    { value: 'administrator', label: 'Administrator' },
  ]
  let value = $state('viewer')
</script>

<div class="grid w-80 gap-2">
  <label id="svelte-role-label" for="svelte-role" class="text-sm font-medium">
    Member role
  </label>
  <Select
    id="svelte-role"
    aria-labelledby="svelte-role-label"
    bind:value
    name="role"
    {options}
  />
  <p class="text-sm text-gray-500">Current value: {value}</p>
</div>
