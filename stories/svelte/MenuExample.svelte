<script>
  import Button from '../../registry/button/svelte/Button.svelte'
  import Menu from '../../registry/menu/svelte/Menu.svelte'
  import { contract, menuItemClass } from '../shared/contract.js'
</script>

{#snippet content()}
  <button type="button" class={menuItemClass}>{contract.menuItems[0]}</button>
  <a href="#svelte-menu" class={menuItemClass}>{contract.menuItems[1]}</a>
  <button
    type="button"
    class={`${menuItemClass} text-red-700 hover:bg-red-50 focus:bg-red-50`}
  >
    {contract.menuItems[2]}
  </button>
{/snippet}

<div>
  <Button popovertarget={contract.menuId}>{contract.menuLabel}</Button>
  <Menu
    id={contract.menuId}
    aria-label="Project actions"
    class="w-56"
    children={content}
  />
</div>
