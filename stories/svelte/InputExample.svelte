<script>
  import Input from '../../registry/input/svelte/Input.svelte'
  import { contract } from '../shared/contract.js'

  let { invalid = false } = $props()
  let value = $state('')
  let errorId = $derived(invalid ? 'svelte-project-name-error' : undefined)
</script>

<div class="w-80">
  <label for="svelte-project-name" class="mb-2 block font-medium">
    {contract.inputLabel}
  </label>
  <Input
    id="svelte-project-name"
    bind:value
    aria-invalid={invalid || undefined}
    aria-describedby={errorId}
    placeholder="Billing portal"
  />
  {#if invalid}
    <p id={errorId} class="mt-2 text-sm text-red-700">
      {contract.inputError}
    </p>
  {/if}
</div>
