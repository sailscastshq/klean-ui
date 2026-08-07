<script>
  import Textarea from '../../registry/textarea/svelte/Textarea.svelte'
  import { contract } from '../shared/contract.js'

  let value = $state('')
</script>

<div class="w-96 max-w-[calc(100vw-2rem)]">
  <label for="svelte-internal-note" class="mb-2 block font-medium">
    {contract.textareaLabel}
  </label>
  <Textarea
    id="svelte-internal-note"
    bind:value
    placeholder="Add context for your team…"
  />
</div>
