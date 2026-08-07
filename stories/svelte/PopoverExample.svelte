<script>
  import Button from '../../registry/button/svelte/Button.svelte'
  import Popover from '../../registry/popover/svelte/Popover.svelte'
  import { contract } from '../shared/contract.js'
</script>

{#snippet content({ close })}
  <section aria-labelledby="svelte-filter-title">
    <h2 id="svelte-filter-title" class="font-semibold">Visible records</h2>
    <p class="mt-1 text-sm leading-6 text-gray-600">
      The browser owns the popover layer; Klean adds durable positioning.
    </p>
    <Button onclick={close} class="mt-4 w-full">Done</Button>
  </section>
{/snippet}

<div>
  <Button popovertarget={contract.popoverId}>{contract.popoverLabel}</Button>
  <Popover id={contract.popoverId} class="w-72" children={content} />
</div>
