<script>
  import Combobox from '../../registry/combobox/svelte/Combobox.svelte'

  const options = [
    {
      value: 'slipway',
      label: 'Slipway',
      description: 'Deploy Sails applications',
    },
    { value: 'retired', label: 'Retired service', disabled: true },
    {
      value: 'hagfish',
      label: 'Hagfish',
      description: 'Invoices and customers',
      keywords: ['billing'],
    },
  ]
  let value = $state('slipway')
</script>

<div class="grid w-80 gap-2">
  <label for="svelte-project" class="text-sm font-medium">Project</label>
  <Combobox id="svelte-project" bind:value name="project" {options} />
  <p class="text-sm text-gray-500">Committed value: {value}</p>
</div>
